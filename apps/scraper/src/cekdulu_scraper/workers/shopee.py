from __future__ import annotations

import re
from typing import Any
from urllib.parse import quote

from playwright.async_api import Page

from ..models import MarketplaceSlug, ProductRecord, StockStatus
from .base import BaseMarketplaceWorker


class ShopeeWorker(BaseMarketplaceWorker):
    marketplace = MarketplaceSlug.shopee

    async def _scrape(self, page: Page, payload: dict[str, Any]) -> list[ProductRecord]:
        query = str(payload.get('query') or payload.get('keyword') or 'iphone').strip()
        limit = int(payload.get('limit') or 20)
        limit = max(1, min(limit, 30))

        records: list[ProductRecord] = []

        # Prefer same-origin browser fetch to Shopee search API to reduce 403 anti-bot responses.
        try:
            await page.goto(f'https://shopee.co.id/search?keyword={quote(query)}', wait_until='domcontentloaded')
            await page.wait_for_timeout(2500)

            api_result = await page.evaluate(
                """
                async ({ query, limit }) => {
                  const url = `/api/v4/search/search_items?by=relevancy&keyword=${encodeURIComponent(query)}&limit=${limit}&newest=0&order=desc&page_type=search`;
                  const response = await fetch(url, { credentials: 'include' });
                  const text = await response.text();
                  try {
                    return { ok: response.ok, status: response.status, data: JSON.parse(text) };
                  } catch {
                    return { ok: false, status: response.status, text };
                  }
                }
                """,
                {'query': query, 'limit': limit},
            )

            data = (api_result or {}).get('data') or {}
            if (api_result or {}).get('ok'):
                for item in (data.get('items') or [])[:limit]:
                    basic = item.get('item_basic') or {}
                    item_id = basic.get('itemid')
                    shop_id = basic.get('shopid')
                    if not item_id or not shop_id:
                        continue

                    title = str(basic.get('name') or f'Shopee Product {item_id}')
                    image_hash = basic.get('image')
                    image_url = f'https://cf.shopee.co.id/file/{image_hash}' if image_hash else None
                    rating_info = basic.get('item_rating') or {}

                    price_raw = basic.get('price') or 0
                    original_raw = basic.get('price_before_discount') or 0
                    # Shopee prices are commonly stored with 1e5 multiplier.
                    price = int(price_raw / 100000) if price_raw else 0
                    original_price = int(original_raw / 100000) if original_raw else None

                    records.append(
                        ProductRecord(
                            marketplace=self.marketplace,
                            external_id=str(item_id),
                            title=title,
                            slug=title.lower().replace(' ', '-'),
                            url=f'https://shopee.co.id/product/{shop_id}/{item_id}',
                            image_url=image_url,
                            price=price,
                            original_price=original_price,
                            rating=float(rating_info.get('rating_star') or 0),
                            review_count=int(rating_info.get('rcount_with_context') or 0),
                            sold_count=int(basic.get('historical_sold') or basic.get('sold') or 0),
                            stock_status=StockStatus.unknown,
                            raw={'query': query, 'shopId': shop_id, 'itemId': item_id, 'api': True}
                        )
                    )

                if records:
                    return records
        except Exception:
            # Fall back to DOM extraction if API request fails.
            pass

        await page.goto(f'https://shopee.co.id/search?keyword={quote(query)}', wait_until='networkidle')
        await page.wait_for_timeout(2500)
        html = await page.content()
        soup = self.parse_html(html)
        nodes = soup.select('a[href*="/product/"]') or soup.select('a[href*="-i."]')
        for index, node in enumerate(nodes[:limit]):
            title = node.get_text(' ', strip=True) or f'Shopee Product {index + 1}'
            href = node.get('href') or '#'
            full_url = href if href.startswith('http') else f'https://shopee.co.id{href}'
            match = re.search(r'-i\.(\d+)\.(\d+)', full_url)
            external_id = match.group(2) if match else str(index + 1)
            records.append(
                ProductRecord(
                    marketplace=self.marketplace,
                    external_id=external_id,
                    title=title,
                    slug=title.lower().replace(' ', '-'),
                    url=full_url,
                    image_url=None,
                    price=0,
                    stock_status=StockStatus.unknown,
                    raw={'query': query, 'api': False}
                )
            )
        return records

    async def scrape_product(self, page: Page, url: str) -> ProductRecord | None:
        try:
            await page.goto(url, wait_until='networkidle')
            await page.wait_for_timeout(1200)

            # try JSON-LD or __NEXT_DATA__
            json_text = await page.evaluate("""
                () => {
                    try {
                        const s = document.querySelector('script#__NEXT_DATA__') || document.querySelector('script[type="application/ld+json"]');
                        return s ? s.textContent : null;
                    } catch(e) { return null; }
                }
            """)

            parsed = None
            if json_text:
                try:
                    parsed = __import__('json').loads(json_text)
                except Exception:
                    parsed = None

            # meta fallback
            title = await page.evaluate("() => document.querySelector('meta[property=\\\"og:title\\\"]')?.content || document.title || ''")
            og_image = await page.evaluate("() => document.querySelector('meta[property=\\\"og:image\\\"]')?.content || null")
            description = await page.evaluate("() => document.querySelector('meta[property=\\\"og:description\\\"]')?.content || document.querySelector('meta[name=\\\"description\\\"]')?.content || ''")

            # attempt to extract itemid/shopid from url pattern or embedded
            import re as _re
            match = _re.search(r'-i\.(\d+)\.(\d+)', url)
            shop_id = None
            item_id = None
            if match:
                shop_id = match.group(1)
                item_id = match.group(2)

            if parsed and not item_id:
                txt = __import__('json').dumps(parsed)
                m = _re.search(r'\"itemid\"\\s*[:=]\\s*\"?(\d+)\"?', txt)
                if m:
                    item_id = m.group(1)
                m2 = _re.search(r'\"shopid\"\\s*[:=]\\s*\"?(\d+)\"?', txt)
                if m2:
                    shop_id = m2.group(1)

            # price attempts
            price_text = await page.evaluate("() => { const el = document.querySelector('[data-sqe=price], .pdp-price, .product-price, ._3n5NQ'); return el?.innerText || null }")
            price = None
            if price_text:
                num = __import__('re').sub(r'[^0-9]', '', price_text)
                if num:
                    try:
                        price = float(num)
                    except Exception:
                        price = None

            record = ProductRecord(
                marketplace=self.marketplace,
                external_id=str(item_id) if item_id else None,
                title=title or None,
                slug=(title or '').lower().replace(' ', '-')[:80],
                url=url,
                image_url=og_image,
                price=price or 0,
                original_price=None,
                rating=0.0,
                review_count=0,
                sold_count=0,
                stock_status=StockStatus.unknown,
                raw={'parsed': parsed}
            )

            return record
        except Exception:
            return None
