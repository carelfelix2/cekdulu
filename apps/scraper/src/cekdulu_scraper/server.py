from __future__ import annotations

import asyncio
import json
import re
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
import uvicorn
from playwright.async_api import async_playwright

from .models import MarketplaceSlug
from .settings import settings

app = FastAPI(title='CekDulu Scraper HTTP')

class FetchRequest(BaseModel):
    url: HttpUrl

class FetchResponse(BaseModel):
    productName: str | None = None
    productUrl: str | None = None
    imageUrl: str | None = None
    images: list[str] | None = None
    price: float | None = None
    originalPrice: float | None = None
    discount: float | None = None
    rating: float | None = None
    reviewCount: int | None = None
    soldCount: int | None = None
    shopName: str | None = None
    shopLocation: str | None = None
    description: str | None = None
    specifications: dict | None = None
    category: str | None = None
    brand: str | None = None
    marketplace: str | None = None
    itemId: str | None = None
    shopId: str | None = None
    raw: dict | None = None


async def _scrape_product(url: str) -> dict[str, Any]:
    async with async_playwright() as playwright:
        launch_options: dict[str, Any] = {'headless': True}
        if settings.proxy_url:
            launch_options['proxy'] = {'server': settings.proxy_url}
        browser = await playwright.chromium.launch(**launch_options)
        try:
            page = await browser.new_page()
            page.set_default_navigation_timeout(60000)
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(2500)

            # Extract title and meta tags
            title = await page.title()
            og_title = await page.evaluate('() => document.querySelector(\'meta[property="og:title"]\')?.content || document.querySelector(\'meta[name="title"]\')?.content || ""')
            og_image = await page.evaluate('() => document.querySelector(\'meta[property="og:image"]\')?.content || null')
            og_desc = await page.evaluate('() => document.querySelector(\'meta[property="og:description"]\')?.content || document.querySelector(\'meta[name="description"]\')?.content || ""')

            # Try to extract embedded JSON-LD
            jsonld_text = await page.evaluate('() => { const s = document.querySelector(\'script#__NEXT_DATA__\') || document.querySelector(\'script[type="application/ld+json"]\'); return s ? s.textContent : null }')
            
            parsed_json = None
            if jsonld_text:
                try:
                    parsed_json = json.loads(jsonld_text)
                except Exception:
                    parsed_json = None

            # Try to extract embedded itemid/shopid from window props
            embedded = await page.evaluate('() => { try { const keys = Object.keys(window); for (const k of keys) { if (k && window[k] && typeof window[k] === "object") { const s = JSON.stringify(window[k]).slice(0,5000); if (s && s.includes("itemid") && s.includes("shopid")) return window[k]; } } return null; } catch(e) { return null; } }')

            result: dict[str, Any] = {
                'productName': og_title or title or 'Product',
                'productUrl': url,
                'imageUrl': og_image,
                'images': [og_image] if og_image else [],
                'price': None,
                'originalPrice': None,
                'discount': None,
                'rating': None,
                'reviewCount': None,
                'soldCount': None,
                'shopName': None,
                'shopLocation': None,
                'description': og_desc,
                'specifications': None,
                'category': None,
                'brand': None,
                'marketplace': 'shopee',
                'itemId': None,
                'shopId': None,
                'raw': {}
            }

            # Extract itemid/shopid from URL pattern
            match = re.search(r'-i\.(\d+)\.(\d+)', url)
            if match:
                result['shopId'] = match.group(1)
                result['itemId'] = match.group(2)

            # Try to find itemid/shopid in embedded JSON
            if embedded:
                try:
                    txt = json.dumps(embedded)
                    m_item = re.search(r'"itemid"\s*[:=]\s*"?(\d+)"?', txt)
                    if m_item and not result['itemId']:
                        result['itemId'] = m_item.group(1)
                    m_shop = re.search(r'"shopid"\s*[:=]\s*"?(\d+)"?', txt)
                    if m_shop and not result['shopId']:
                        result['shopId'] = m_shop.group(1)
                    result['raw'] = {'embedded_found': True}
                except Exception:
                    pass

            # Try to extract price from selectors
            price_text = await page.evaluate('() => { const el = document.querySelector("[data-sqe=price], .pdp-price, .product-price, ._3n5NQ"); return el?.innerText || null }')
            if price_text:
                num = re.sub(r'[^0-9]', '', price_text)
                if num:
                    try:
                        result['price'] = float(num)
                    except Exception:
                        pass

            # Try to extract sold count
            sold_text = await page.evaluate('() => { const el = document.querySelector(".product-quantity, .pdp-sold, ._3M2Vq"); return el?.innerText || null }')
            if sold_text:
                num = re.sub(r'[^0-9]', '', sold_text)
                if num:
                    try:
                        result['soldCount'] = int(num)
                    except Exception:
                        pass

            # Populate from parsed JSON if available
            if parsed_json and isinstance(parsed_json, dict):
                if not result['productName'] and parsed_json.get('name'):
                    result['productName'] = parsed_json.get('name')
                if not result['description'] and parsed_json.get('description'):
                    result['description'] = parsed_json.get('description')
                if parsed_json.get('image'):
                    img = parsed_json.get('image')
                    if isinstance(img, list):
                        result['images'] = img
                        result['imageUrl'] = img[0]
                    else:
                        result['imageUrl'] = img
                        result['images'] = [img]

            await page.close()
            return result
        finally:
            await browser.close()


@app.post('/product')
async def fetch_product(req: FetchRequest):
    try:
        result = await _scrape_product(str(req.url))
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == '__main__':
    uvicorn.run('cekdulu_scraper.server:app', host='0.0.0.0', port=settings.port, reload=False)
