from __future__ import annotations

import asyncio
import json
from typing import Any

import httpx
from playwright.async_api import async_playwright

from .matching import find_duplicates, group_products
from .models import MarketplaceSlug, ProductRecord
from .queue import queue_client
from .scheduler import scheduler
from .settings import settings
from .workers.blibli import BlibliWorker
from .workers.bukalapak import BukalapakWorker
from .workers.lazada import LazadaWorker
from .workers.shopee import ShopeeWorker
from .workers.tiktok import TikTokWorker
from .workers.tokopedia import TokopediaWorker

WORKER_MAP = {
    MarketplaceSlug.shopee: ShopeeWorker,
    MarketplaceSlug.tokopedia: TokopediaWorker,
    MarketplaceSlug.tiktok_shop: TikTokWorker,
    MarketplaceSlug.lazada: LazadaWorker,
    MarketplaceSlug.blibli: BlibliWorker,
    MarketplaceSlug.bukalapak: BukalapakWorker,
}


def record_to_item(record: ProductRecord) -> dict[str, Any]:
    return {
        'productName': record.title,
        'title': record.title,
        'productUrl': record.url,
        'imageUrl': record.image_url,
        'price': record.price,
        'rating': record.rating,
        'soldCount': record.sold_count,
        'reviewCount': record.review_count,
        'itemId': record.external_id,
        'shopId': None,
        'rawData': record.raw,
    }


async def report_results(scraping_job_id: str, payload: dict[str, Any], records: list[ProductRecord]) -> None:
    items = [record_to_item(record) for record in records]
    api_base = settings.api_base_url.rstrip('/')
    url = f"{api_base}/api/scraping/jobs/{scraping_job_id}/results"
    body = {
        'items': items,
        'keyword': payload.get('keyword') or payload.get('query') or '',
        'marketplace': payload.get('marketplace'),
        'source': 'worker',
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, json=body)
        response.raise_for_status()


async def report_failed(scraping_job_id: str, message: str) -> None:
    api_base = settings.api_base_url.rstrip('/')
    url = f"{api_base}/api/scraping/jobs/{scraping_job_id}/failed"
    async with httpx.AsyncClient(timeout=30) as client:
        await client.post(url, json={'error': message})


async def process_message(message: Any, browser) -> None:
    async with message.process():
        raw_payload = json.loads(message.body.decode())
        payload = raw_payload.get('data') if isinstance(raw_payload, dict) and 'data' in raw_payload else raw_payload
        if not isinstance(payload, dict):
            payload = {}

        scraping_job_id = payload.get('scrapingJobId')

        try:
            marketplace_value = payload.get('marketplace')
            if not marketplace_value:
                print(f"[WARN] Missing marketplace in payload: {raw_payload}")
                return

            marketplace = MarketplaceSlug(marketplace_value)
            worker_cls = WORKER_MAP[marketplace]
            worker = worker_cls(browser)

            # Worker expects `query`; API queue payload sends `keyword`.
            payload['query'] = payload.get('query') or payload.get('keyword')

            records = await worker.scrape(payload)
            groups = group_products(records)
            duplicates = find_duplicates(records)

            print(json.dumps({
                'jobId': scraping_job_id,
                'marketplace': marketplace.value,
                'records': len(records),
                'groups': len(groups),
                'duplicates': len(duplicates),
            }))

            if scraping_job_id:
                if not records:
                    await report_failed(
                        scraping_job_id,
                        'No records returned from Shopee. This environment may be blocked by anti-bot; configure SCRAPER_PROXY_URL and retry.',
                    )
                    return
                await report_results(scraping_job_id, payload, records)
        except Exception as exc:
            print(f"[ERROR] Failed to process message: {exc}")
            print(f"[ERROR] Payload: {payload}")
            if scraping_job_id:
                await report_failed(scraping_job_id, str(exc))
            raise


async def run_consumer() -> None:
    await queue_client.connect()
    async with async_playwright() as playwright:
        launch_options: dict[str, Any] = {'headless': True}
        if settings.proxy_url:
            launch_options['proxy'] = {'server': settings.proxy_url}

        browser = await playwright.chromium.launch(**launch_options)
        async for message in queue_client.consume('cekdulu.scraper'):
            await process_message(message, browser)
        await browser.close()


async def bootstrap() -> None:
    if settings.env == 'development':
        await scheduler.schedule_full_sync()
    await run_consumer()


if __name__ == '__main__':
    asyncio.run(bootstrap())
