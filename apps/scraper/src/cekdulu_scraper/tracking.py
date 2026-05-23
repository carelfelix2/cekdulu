from __future__ import annotations

from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl


def add_tracking_params(url: str, source: str, campaign: str = 'cekdulu', medium: str = 'affiliate') -> str:
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query))
    query.update({
        'utm_source': source,
        'utm_medium': medium,
        'utm_campaign': campaign,
    })
    return urlunparse(parsed._replace(query=urlencode(query)))
