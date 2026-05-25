from __future__ import annotations

import json
import re
from typing import Any

from fastapi import FastAPI, HTTPException
import traceback
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
        launch_options: dict[str, Any] = {'headless': False, 'args': ['--disable-blink-features=AutomationControlled']}
        if settings.proxy_url:
            launch_options['proxy'] = {'server': settings.proxy_url}
        browser = await playwright.chromium.launch(**launch_options)
        try:
            context = await browser.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36', locale='id-ID', viewport={'width':1200,'height':900})
            # basic stealth: override webdriver and navigator properties
            try:
                await context.add_init_script("""() => {
                    Object.defineProperty(navigator, 'webdriver', { get: () => false });
                    Object.defineProperty(navigator, 'languages', { get: () => ['id-ID', 'en-US'] });
                    Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4] });
                }""")
            except Exception:
                pass
            page = await context.new_page()
            page.set_default_navigation_timeout(60000)
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            await page.wait_for_timeout(7000)

            # Extract title and meta tags using safer selectors
            title = await page.title()
            og_title = ''
            try:
                el = await page.query_selector("meta[property='og:title']")
                if el:
                    og_title = await el.get_attribute('content') or ''
                if not og_title:
                    el2 = await page.query_selector("meta[name='title']")
                    if el2:
                        og_title = await el2.get_attribute('content') or ''
            except Exception:
                og_title = ''

            og_image = None
            try:
                el = await page.query_selector("meta[property='og:image']")
                if el:
                    og_image = await el.get_attribute('content')
            except Exception:
                og_image = None

            og_desc = ''
            try:
                el = await page.query_selector("meta[property='og:description']")
                if el:
                    og_desc = await el.get_attribute('content') or ''
                if not og_desc:
                    el2 = await page.query_selector("meta[name='description']")
                    if el2:
                        og_desc = await el2.get_attribute('content') or ''
            except Exception:
                og_desc = ''

            # Try to extract embedded JSON-LD or other script blobs
            jsonld_text = None
            try:
                s = await page.query_selector("script#__NEXT_DATA__")
                if not s:
                    s = await page.query_selector("script[type='application/ld+json']")
                if s:
                    jsonld_text = await s.text_content()
            except Exception:
                jsonld_text = None

            parsed_json = None
            if jsonld_text:
                try:
                    parsed_json = json.loads(jsonld_text)
                except Exception:
                    parsed_json = None

            # Try to extract embedded itemid/shopid from window props (skip heavy window scanning)
            embedded = None

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

            # Another common Shopee product URL pattern: /product/{shopId}/{itemId}
            if not result['shopId'] or not result['itemId']:
                m2 = re.search(r'/product/(\d+)/(\d+)', url)
                if m2:
                    result['shopId'] = result['shopId'] or m2.group(1)
                    result['itemId'] = result['itemId'] or m2.group(2)

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

            # Collect all script contents and try to parse additional embedded JSON for Shopee
            try:
                scripts_text = await page.eval_on_selector_all('script', "els => els.map(e => e.textContent || '').join('\n')")
                if not isinstance(scripts_text, str):
                    scripts_text = '\n'.join(scripts_text)
            except Exception:
                scripts_text = ''

            if scripts_text:
                # Try to extract item/shop ids from scripts
                m_item_s = re.search(r'"itemid"\s*[:=]\s*"?(\d+)"?', scripts_text)
                if m_item_s and not result['itemId']:
                    result['itemId'] = m_item_s.group(1)
                m_shop_s = re.search(r'"shopid"\s*[:=]\s*"?(\d+)"?', scripts_text)
                if m_shop_s and not result['shopId']:
                    result['shopId'] = m_shop_s.group(1)

                # Try to find price patterns inside script blobs
                m_price = re.search(r'"price"\s*[:=]\s*"?([0-9]+(?:\.[0-9]+)?)"?', scripts_text)
                if m_price and not result['price']:
                    try:
                        result['price'] = float(m_price.group(1))
                    except Exception:
                        pass

                m_price2 = re.search(r'"current_price"\s*[:=]\s*"?([0-9]+)"?', scripts_text)
                if m_price2 and not result['price']:
                    try:
                        result['price'] = float(m_price2.group(1))
                    except Exception:
                        pass

                # Attempt to extract product name from structured data in scripts
                m_name = re.search(r'"name"\s*:\s*"([^"]{3,200}?)"', scripts_text)
                if m_name and (not result['productName'] or result['productName'].strip() == ''):
                    name_val = m_name.group(1).strip()
                    if 'Shopee Indonesia' not in name_val:
                        result['productName'] = name_val

            # Try to read common client-side globals that may contain item data
            try:
                client_globals = await page.evaluate("() => { try { const names = ['__NEXT_DATA__','__INITIAL_STATE__','__PRELOADED_STATE__','SHOPEE_GLOBAL','__SHOPEE_STATE__','__SSR_DATA__']; const res = {}; for (const n of names) { if (Object.prototype.hasOwnProperty.call(window, n) && typeof window[n] !== 'undefined') { try { res[n] = JSON.stringify(window[n]); } catch(e) { try { res[n] = String(window[n]); } catch(e2) { res[n] = null; } } } } return res; } catch(e) { return null; } }")
                if client_globals and isinstance(client_globals, dict):
                    for name, txt in client_globals.items():
                        if not txt:
                            continue
                        try:
                            parsed = json.loads(txt)
                        except Exception:
                            parsed = None
                        if parsed:
                            # attempt to find item dict inside parsed
                            def find_item(o):
                                if isinstance(o, dict):
                                    # direct keys
                                    if ('itemid' in o and 'shopid' in o) or ('name' in o and ('images' in o or 'itemid' in o)):
                                        return o
                                    for v in o.values():
                                        r = find_item(v)
                                        if r:
                                            return r
                                elif isinstance(o, list):
                                    for it in o:
                                        r = find_item(it)
                                        if r:
                                            return r
                                return None

                            found = find_item(parsed)
                            if found:
                                # map fields
                                if not result.get('itemId') and found.get('itemid'):
                                    result['itemId'] = str(found.get('itemid'))
                                if not result.get('shopId') and found.get('shopid'):
                                    result['shopId'] = str(found.get('shopid'))
                                if not result.get('productName') and found.get('name'):
                                    result['productName'] = found.get('name')
                                if not result.get('description') and found.get('description'):
                                    result['description'] = found.get('description')
                                if not result.get('images') and found.get('images'):
                                    imgs = found.get('images')
                                    norm_imgs = []
                                    for im in imgs:
                                        if isinstance(im, str) and im:
                                            if im.startswith('http'):
                                                norm_imgs.append(im)
                                            else:
                                                norm_imgs.append(f'https://cf.shopee.co.id/file/{im}')
                                    if norm_imgs:
                                        result['images'] = norm_imgs
                                        result['imageUrl'] = norm_imgs[0]
                                # sold/rating
                                if not result.get('soldCount') and (found.get('sold') or found.get('historical_sold')):
                                    try:
                                        result['soldCount'] = int(found.get('sold') or found.get('historical_sold'))
                                    except Exception:
                                        pass
                                # attach raw
                                result['raw']['client_globals_name'] = name
                                break
            except Exception:
                pass

            # Try to capture any XHR response made by the page to item API endpoints
            try:
                def _pred(r):
                    try:
                        return ('/api/v4/item/get' in r.url) or ('/api/v2/item/get' in r.url)
                    except Exception:
                        return False

                try:
                    api_resp_obj = await page.wait_for_response(_pred, timeout=15000)
                except Exception:
                    api_resp_obj = None

                if api_resp_obj:
                    try:
                        api_json = await api_resp_obj.json()
                    except Exception:
                        try:
                            api_text = await api_resp_obj.text()
                            api_json = json.loads(api_text)
                        except Exception:
                            api_json = None
                    if api_json and isinstance(api_json, dict):
                        # map from api_json similar to earlier
                        item_obj = api_json.get('data') or api_json.get('item') or api_json
                        if isinstance(item_obj, dict):
                            result['raw']['xhr_item'] = True
                            result['raw']['xhr_url'] = api_resp_obj.url
                            # map some fields
                            if not result['productName'] and item_obj.get('name'):
                                result['productName'] = item_obj.get('name')
                            imgs = item_obj.get('images') or item_obj.get('image') or []
                            if imgs:
                                norm_imgs = []
                                for im in imgs:
                                    if isinstance(im, str) and im:
                                        if im.startswith('http'):
                                            norm_imgs.append(im)
                                        else:
                                            norm_imgs.append(f'https://cf.shopee.co.id/file/{im}')
                                if norm_imgs:
                                    result['images'] = norm_imgs
                                    result['imageUrl'] = norm_imgs[0]
                            sold = item_obj.get('sold') or item_obj.get('historical_sold')
                            if sold is not None:
                                try:
                                    result['soldCount'] = int(sold)
                                except Exception:
                                    pass
                            if item_obj.get('item_rating') and isinstance(item_obj.get('item_rating'), dict):
                                try:
                                    result['rating'] = float(item_obj['item_rating'].get('rating_star'))
                                    result['reviewCount'] = int(item_obj['item_rating'].get('rating_count')) if item_obj['item_rating'].get('rating_count') else None
                                except Exception:
                                    pass
                            # price
                            for k in ('price','price_min','price_max','price_before_discount','current_price'):
                                v = item_obj.get(k)
                                if v is not None and result['price'] is None:
                                    try:
                                        result['price'] = float(v)
                                    except Exception:
                                        pass
            except Exception:
                pass

            # If we have shopId and itemId, try Shopee public API to get reliable data
            if result.get('shopId') and result.get('itemId'):
                try:
                    api_url = f"https://shopee.co.id/api/v4/item/get?itemid={result['itemId']}&shopid={result['shopId']}"
                    # Use a request context with common browser headers to avoid blocking
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                        'Referer': url,
                    }
                    req_ctx = await playwright.request.new_context(extra_http_headers=headers)
                    api_resp = await req_ctx.get(api_url)
                    # always record status and a small snippet of body for debugging
                    try:
                        result['raw']['api_status'] = api_resp.status
                    except Exception:
                        result['raw']['api_status'] = None
                    api_body = None
                    try:
                        api_text = await api_resp.text()
                        api_body = api_text[:4000]
                        result['raw']['api_body_snippet'] = api_body
                        try:
                            api_json = json.loads(api_text)
                        except Exception:
                            api_json = None
                    except Exception:
                        api_json = None
                        # best-effort find item object
                        item_obj = None
                        if isinstance(api_json, dict):
                            item_obj = api_json.get('data') or api_json.get('item') or api_json
                            # sometimes nested under 'data'->'item'
                            if isinstance(item_obj, dict) and 'item' in item_obj and isinstance(item_obj['item'], dict):
                                item_obj = item_obj['item']

                        if item_obj and isinstance(item_obj, dict):
                            result['raw']['api_item'] = item_obj
                            # name
                            if not result['productName'] and item_obj.get('name'):
                                result['productName'] = item_obj.get('name')
                            # description
                            if not result['description']:
                                result['description'] = item_obj.get('description') or item_obj.get('short_description') or ''
                            # images
                            imgs = item_obj.get('images') or item_obj.get('image') or []
                            if imgs:
                                norm_imgs = []
                                for im in imgs:
                                    if isinstance(im, str) and im:
                                        if im.startswith('http'):
                                            norm_imgs.append(im)
                                        else:
                                            norm_imgs.append(f'https://cf.shopee.co.id/file/{im}')
                                if norm_imgs:
                                    result['images'] = norm_imgs
                                    result['imageUrl'] = norm_imgs[0]
                            # sold
                            sold = item_obj.get('sold') or item_obj.get('historical_sold') or item_obj.get('sold_count')
                            if sold is not None:
                                try:
                                    result['soldCount'] = int(sold)
                                except Exception:
                                    pass
                            # rating
                            if item_obj.get('item_rating') and isinstance(item_obj.get('item_rating'), dict):
                                try:
                                    result['rating'] = float(item_obj['item_rating'].get('rating_star'))
                                    result['reviewCount'] = int(item_obj['item_rating'].get('rating_count')) if item_obj['item_rating'].get('rating_count') else None
                                except Exception:
                                    pass
                            # price candidates
                            for k in ('price', 'price_min', 'price_max', 'price_before_discount', 'current_price', 'price_show'):
                                v = item_obj.get(k)
                                if v is not None and result['price'] is None:
                                    try:
                                        # Shopee often uses integer price in cents-like units; attempt reasonable normalization
                                        pv = float(v)
                                        # if price looks like a very large integer (>=1e6), assume it's already in IDR
                                        result['price'] = pv
                                    except Exception:
                                        pass
                            # shop info
                            if item_obj.get('shopid') and not result.get('shopId'):
                                result['shopId'] = str(item_obj.get('shopid'))
                            if item_obj.get('shop_location'):
                                result['shopLocation'] = item_obj.get('shop_location')
                        # If direct API call was blocked, try to fetch from page context (includes cookies/headers)
                        if (not api_json) and result.get('shopId') and result.get('itemId'):
                            try:
                                fetch_js = '''(url) => { try { return fetch(url, {credentials: 'include'}).then(async r => { try { const t=await r.text(); try { return JSON.parse(t); } catch(e){ return {__text: t}; } }); } catch(e) { return null } }'''
                                page_api = await page.evaluate(fetch_js, api_url)
                                if page_api and isinstance(page_api, dict):
                                    api_json = page_api
                            except Exception:
                                api_json = None
                    await req_ctx.dispose()
                except Exception:
                    pass

            # Try to extract price from selectors
            price_text = None
            try:
                el = await page.query_selector("[data-sqe=price], .pdp-price, .product-price, ._3n5NQ")
                if el:
                    price_text = await el.text_content()
            except Exception:
                price_text = None
            if price_text:
                num = re.sub(r'[^0-9]', '', price_text)
                if num:
                    try:
                        result['price'] = float(num)
                    except Exception:
                        pass

            # Try to extract sold count
            sold_text = None
            try:
                el = await page.query_selector('.product-quantity, .pdp-sold, ._3M2Vq')
                if el:
                    sold_text = await el.text_content()
            except Exception:
                sold_text = None
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
            await context.close()
            return result
        finally:
            await browser.close()


@app.post('/product')
async def fetch_product(req: FetchRequest):
    try:
        result = await _scrape_product(str(req.url))
        return result
    except Exception as exc:
        tb = traceback.format_exc()
        print('SCRAPER ERROR:')
        print(tb)
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == '__main__':
    uvicorn.run('cekdulu_scraper.server:app', host='0.0.0.0', port=settings.port, reload=False)
