from __future__ import annotations

import abc
from dataclasses import asdict
from typing import Any
from bs4 import BeautifulSoup
from playwright.async_api import Browser, Page

from ..models import MarketplaceSlug, ProductRecord, StockStatus
from ..settings import settings
from ..tracking import add_tracking_params


class BaseMarketplaceWorker(abc.ABC):
    marketplace: MarketplaceSlug

    def __init__(self, browser: Browser) -> None:
        self.browser = browser

    async def scrape(self, payload: dict[str, Any]) -> list[ProductRecord]:
        page = await self.browser.new_page(user_agent=settings.user_agent)
        try:
            return await self._scrape(page, payload)
        finally:
            await page.close()

    @abc.abstractmethod
    async def _scrape(self, page: Page, payload: dict[str, Any]) -> list[ProductRecord]:
        raise NotImplementedError

    def parse_html(self, html: str) -> BeautifulSoup:
        return BeautifulSoup(html, 'html.parser')

    def build_affiliate_url(self, url: str, source: str) -> str:
        return add_tracking_params(url, source=source)

    def normalize_stock(self, text: str | None) -> StockStatus:
        value = (text or '').lower()
        if any(token in value for token in ['habis', 'sold out', 'out of stock']):
            return StockStatus.out_of_stock
        if any(token in value for token in ['hampir', 'sisa', 'low']):
            return StockStatus.low_stock
        if value:
            return StockStatus.in_stock
        return StockStatus.unknown
