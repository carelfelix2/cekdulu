# CekDulu Architecture

## Goals
- Massive product ingestion
- Low-latency price search
- SEO-first public pages
- High-conversion affiliate routing
- Admin-first operations

## Core services
- Web: Next.js App Router SSR/ISR
- API: NestJS REST API
- Database: PostgreSQL + Prisma
- Cache: Redis
- Queue: RabbitMQ
- Search: OpenSearch
- Workers: Python scraping engine

## Data flow
1. Scheduler enqueues marketplace crawl jobs.
2. Scraper workers fetch listings and normalize payloads.
3. API persists products, listings, price points, and match groups.
4. Search index updates asynchronously.
5. Web reads from API, cache, and search endpoints.
6. Affiliate click is tracked before redirecting to marketplace.

## Worth it score
Score is a configurable weighted sum with normalization and manual overrides.

Default formula:
- price: 22%
- rating: 16%
- reviews: 12%
- seller reputation: 10%
- discount: 8%
- cashback: 6%
- popularity: 8%
- price history: 8%
- specs match: 5%
- admin override: 5%

The weights are stored in the database and can be changed per category or marketplace.
