from __future__ import annotations

import asyncio
import json
from typing import Any

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


async def process_message(message: Any, browser) -> None:
    async with message.process():
        payload = json.loads(message.body.decode())
        marketplace = MarketplaceSlug(payload['marketplace'])
        worker_cls = WORKER_MAP[marketplace]
        worker = worker_cls(browser)
        groups = group_products(records)
        duplicates = find_duplicates(records)
        print(json.dumps({
            'marketplace': marketplace.value,
            'records': len(records),
            'groups': len(groups),
            'duplicates': len(duplicates)
        }))
        try:
                payload = json.loads(message.body.decode())
                print(f"DEBUG: Message payload: {json.dumps(payload)}")
                marketplace = MarketplaceSlug(payload['marketplace'])
                worker_cls = WORKER_MAP[marketplace]
                worker = worker_cls(browser)
                records = await worker.scrape(payload)
                groups = group_products(records)
                duplicates = find_duplicates(records)
                print(json.dumps({
                    'marketplace': marketplace.value,
async def process_message(message: Any, browser) -> None:
                    'records': len(records),
                    'groups': len(groups),
                    'duplicates': len(duplicates)
                }))
        except Exception as e:
            print(f"ERROR: Failed to process message: {e}")
            print(f"Message body: {message.body}")
            raise


async def process_message(message: Any, browser) -> None:
async def run_consumer() -> None:
    await queue_client.connect()
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        async for message in queue_client.consume('cekdulu.scraper'):
            await process_message(message, browser)
        await browser.close()


async def bootstrap() -> None:
    if settings.env == 'development':
        await scheduler.schedule_full_sync()
    await run_consumer()


if __name__ == '__main__':
    asyncio.run(bootstrap())
