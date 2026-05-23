# Deployment Guide

## Production stack
- Docker Compose for small VPS
- Nginx reverse proxy
- PostgreSQL managed or self-hosted
- Redis for cache and job state
- RabbitMQ for scraping queues
- OpenSearch for product search

## Recommended environment variables
- Configure separate secrets for access and refresh JWT
- Restrict CORS to the public domain
- Set marketplace credentials in secret storage
- Rotate scraper proxy credentials periodically

## Release checklist
- Run database migrations
- Generate Prisma client
- Warm search indexes
- Verify Redis and RabbitMQ health
- Enable log shipping and alerting
- Smoke test public pages and affiliate redirects

## Observability
- Application logs to stdout
- Request IDs on all API responses
- Error reporting to Sentry or equivalent
- Metrics endpoint for scraping throughput and queue depth
