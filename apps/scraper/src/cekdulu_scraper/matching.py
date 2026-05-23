from __future__ import annotations

from difflib import SequenceMatcher
from collections.abc import Iterable

from .models import ProductRecord


def normalize_title(title: str) -> str:
    cleaned = title.lower()
    for token in ['official store', 'new', 'ori', 'original', 'promo', 'gratis ongkir']:
                cleaned = cleaned.replace(token, ' ')
    return ' '.join(cleaned.split())


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_title(a), normalize_title(b)).ratio()


def find_duplicates(records: Iterable[ProductRecord], threshold: float = 0.89) -> list[tuple[ProductRecord, ProductRecord, float]]:
    items = list(records)
    duplicates: list[tuple[ProductRecord, ProductRecord, float]] = []
    for i, left in enumerate(items):
        for right in items[i + 1 :]:
            score = similarity(left.title, right.title)
            if score >= threshold:
                duplicates.append((left, right, score))
    return duplicates


def group_products(records: Iterable[ProductRecord], threshold: float = 0.86) -> list[list[ProductRecord]]:
    groups: list[list[ProductRecord]] = []
    for record in records:
        placed = False
        for group in groups:
            if any(similarity(record.title, other.title) >= threshold for other in group):
                group.append(record)
                placed = True
                break
        if not placed:
            groups.append([record])
    return groups
