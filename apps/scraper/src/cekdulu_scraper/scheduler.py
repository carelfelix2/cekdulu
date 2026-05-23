from __future__ import annotations

from datetime import datetime, timedelta

from .models import MarketplaceSlug, ScrapeJobPayload
from .queue import queue_client


class ScrapeScheduler:
    async def enqueue_marketplace(self, marketplace: MarketplaceSlug, query: str | None = None, page: int = 1) -> None:
        payload = ScrapeJobPayload(marketplace=marketplace, query=query, page=page)
        await queue_client.publish('scrape.job', {
            'marketplace': payload.marketplace.value,
            'query': payload.query,
            'category_slug': payload.category_slug,
            'page': payload.page,
            'limit': payload.limit,
            'priority': payload.priority,
            'metadata': payload.metadata,
        })

    async def schedule_full_sync(self) -> None:
        for marketplace in MarketplaceSlug:
            await self.enqueue_marketplace(marketplace)

    async def next_run_at(self) -> datetime:
        return datetime.utcnow() + timedelta(minutes=15)


scheduler = ScrapeScheduler()
