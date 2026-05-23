from __future__ import annotations

from dataclasses import dataclass

from .settings import settings


@dataclass(slots=True)
class ProxyConfig:
    server: str
    username: str | None = None
    password: str | None = None


def build_proxy_config() -> ProxyConfig | None:
    if not settings.proxy_url:
        return None
    return ProxyConfig(server=settings.proxy_url)
