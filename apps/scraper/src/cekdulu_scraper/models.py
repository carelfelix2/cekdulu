from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import Any


class MarketplaceSlug(StrEnum):
    shopee = "shopee"
    tokopedia = "tokopedia"
    tiktok_shop = "tiktok_shop"
    lazada = "lazada"
    blibli = "blibli"
    bukalapak = "bukalapak"


class StockStatus(StrEnum):
    in_stock = "IN_STOCK"
    low_stock = "LOW_STOCK"
    out_of_stock = "OUT_OF_STOCK"
    unknown = "UNKNOWN"


@dataclass(slots=True)
class ProductRecord:
    marketplace: MarketplaceSlug
    external_id: str
    title: str
    slug: str
    url: str
    image_url: str | None
    price: int
    original_price: int | None = None
    discount_percent: float = 0.0
    cashback_value: int = 0
    rating: float = 0.0
    review_count: int = 0
    sold_count: int = 0
    seller_name: str | None = None
    seller_rating: float | None = None
    seller_review_count: int | None = None
    stock_status: StockStatus = StockStatus.unknown
    brand: str | None = None
    category: str | None = None
    description: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)
    scraped_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class ScrapeJobPayload:
    marketplace: MarketplaceSlug
    query: str | None = None
    category_slug: str | None = None
    page: int = 1
    limit: int = 50
    priority: int = 5
    metadata: dict[str, Any] = field(default_factory=dict)
