from __future__ import annotations

from typing import Any

from playwright.async_api import Page

from ..models import MarketplaceSlug, ProductRecord
from .base import BaseMarketplaceWorker


class BukalapakWorker(BaseMarketplaceWorker):
    marketplace = MarketplaceSlug.bukalapak

    async def _scrape(self, page: Page, payload: dict[str, Any]) -> list[ProductRecord]:
        return []
