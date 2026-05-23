# CekDulu

Startup-grade affiliate price comparison platform for Indonesia.

## Scope
- Next.js App Router frontend
- NestJS API backend
- PostgreSQL + Prisma
- Redis cache
- RabbitMQ queueing
- OpenSearch search layer
- Python scraping workers
- Docker production stack

## Repository layout
- apps/web: public site and admin dashboard
- apps/api: REST API and business logic
- apps/scraper: async scraping engine and queue consumers
- packages/shared: shared types, scoring, marketplace metadata
- packages/database: Prisma schema and database client
- infra: Docker and Nginx production setup
- docs: architecture and deployment notes

## Launch path
1. Copy `.env.example` to `.env` files for each service.
2. Install dependencies with pnpm and Python requirements.
3. Run database migrations and Prisma generate.
4. Start the stack with Docker Compose or local dev commands.

## Notes
- The existing prototype HTML file is preserved as a visual reference.
- Production features included in the scaffold:
  - worth-it score engine
  - affiliate click tracking
  - price history model
  - SEO article system
  - RBAC auth system
  - scraper scheduler and queue architecture
  - search + cache integration
