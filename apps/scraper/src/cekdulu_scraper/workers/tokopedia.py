from __future__ import annotations

from typing import Any

from playwright.async_api import Page

from ..models import MarketplaceSlug, ProductRecord, StockStatus
from .base import BaseMarketplaceWorker


class TokopediaWorker(BaseMarketplaceWorker):
    marketplace = MarketplaceSlug.tokopedia

    async def _scrape(self, page: Page, payload: dict[str, Any]) -> list[ProductRecord]:
        query = payload.get('query') or 'iphone'
        await page.goto(f'https://www.tokopedia.com/search?st=product&q={query}', wait_until='domcontentloaded')
        html = await page.content()
        soup = self.parse_html(html)
        records: list[ProductRecord] = []
        for index, node in enumerate(soup.select('a[href*="/p/"]')[:20]):
            title = node.get_text(' ', strip=True) or f'Tokopedia Product {index + 1}'
            href = node.get('href') or '#'
            records.append(
                ProductRecord(
                    marketplace=self.marketplace,
                    external_id=str(index + 1),
                    title=title,
                    slug=title.lower().replace(' ', '-'),
                    url=href if href.startswith('http') else f'https://www.tokopedia.com{href}',
                    image_url=None,
                    price=0,
                    stock_status=StockStatus.unknown,
                    raw={'query': query}
                )
            )
        return records
