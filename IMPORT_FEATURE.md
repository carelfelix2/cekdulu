# Import Product by URL - Implementation Guide

## Feature Overview
The "Import Product by URL" feature allows admins to curl product URLs from marketplaces (Shopee for now) without relying on bulk scraping. This provides a curated, stable, and scalable affiliate product import workflow.

## Architecture

### Frontend (Next.js Admin)
- **Import Modal**: Modal in `/admin` page with URL input and preview
- **Flow**:
  1. Admin clicks "Import product" button in quick actions
  2. Pastes product URL (e.g., `https://shopee.co.id/product/...`)
  3. Clicks "Fetch Product" to see preview
  4. Clicks "Save Product" to finalize import and create:
     - Product (main catalog entry)
     - ProductListing (marketplace listing)
     - ProductPrice (price snapshot)
     - AffiliateLink (internal redirect)
     - ScrapedProduct (raw record for tracking)

### Backend API (`/api/product-import`)
- **POST `/product-import/fetch`**: Fetch product details from URL
  - Request: `{ url: string }`
  - Response: `{ success: true, product: {...} }`
  - Calls scraper HTTP server endpoint `/product`
  
- **POST `/product-import/save`**: Save fetched product to database
  - Request: `{ productData: {...} }`
  - Response: `{ success: true, productId, listingId, affiliateId }`
  - Deduplicates by productUrl and marketplace+itemId
  - Auto-publishes product as PUBLISHED status

- **GET `/product-import/history`**: List imported products (upcoming feature)

### Scraper HTTP Server (Python)
- **FastAPI server** on `http://localhost:8010`
- **POST `/product`**: Scrape single product URL
  - Request: `{ url: string }`
  - Response: `{ productName, productUrl, price, rating, ... }`
  - Supports Shopee for now
  - Uses Playwright to fetch:
    - Embedded JSON-LD / __NEXT_DATA__
    - Meta tags (og:title, og:image, og:description)
    - Seller/item IDs from URL pattern or window props
    - Price and sold count from DOM selectors
  - Proxy support via `SCRAPER_PROXY_URL` env var

## Setup Instructions

### 1. Install Python dependencies
```bash
cd apps/scraper
pip install -e .
python -m playwright install --with-deps
python -m playwright install chromium
```

### 2. Start services (in separate terminals)

**Terminal 1 - Database & Cache**:
```bash
cd c:\laragon\www\cekdulu
docker-compose up -d postgres redis rabbitmq
```

**Terminal 2 - API**:
```bash
pnpm --filter @cekdulu/api dev
# API runs on http://localhost:4000/api
```

**Terminal 3 - Web**:
```bash
pnpm --filter @cekdulu/web dev
# Web runs on http://localhost:3000
```

**Terminal 4 - Scraper HTTP Server** (optional, but required for import feature):
```bash
cd apps/scraper
python -m cekdulu_scraper.server
# Server runs on http://localhost:8010
```

### 3. Configuration
Ensure `.env` has:
```
SCRAPER_API_BASE_URL=http://localhost:8010
```

Optional proxy for anti-bot:
```
SCRAPER_PROXY_URL=http://username:password@proxy-host:port
```

## Usage

### Test Import Flow via Admin UI
1. Go to `http://localhost:3000/admin` (login if needed)
2. Click **"Import product"** button in quick actions
3. Paste a Shopee URL: `https://shopee.co.id/product/123/456`
4. Click **"Fetch Product"** to see preview
5. Click **"Save Product"** to import

### Expected Result
- Product appears in admin Products table with status DRAFT (or PUBLISHED)
- Product is visible on website at `/products/[slug]`
- Affiliate link auto-created for tracking
- Price snapshot stored for trending/comparison

## Database Schema

### New Models
None added; feature reuses existing:
- `Product` (main catalog)
- `ProductListing` (marketplace listing)
- `ProductPrice` (price snapshots)
- `AffiliateLink` (redirect tracking)
- `ScrapedProduct` (raw import records)

### Deduplication Logic
1. Check by `productUrl` in ProductListing
2. Check by `marketplaceId + itemId` in ProductListing
3. Check by `slug` in Product (for name similarity)
4. If found, update; otherwise, create new

## API Endpoints

### Fetch Product
```bash
curl -X POST http://localhost:4000/api/product-import/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"https://shopee.co.id/..."}'
```

Response:
```json
{
  "success": true,
  "product": {
    "productName": "...",
    "productUrl": "...",
    "price": 1999000,
    "imageUrl": "...",
    "rating": 4.5,
    "soldCount": 100,
    "marketplace": "shopee",
    "itemId": "123456"
  }
}
```

### Save Product
```bash
curl -X POST http://localhost:4000/api/product-import/save \
  -H "Content-Type: application/json" \
  -d '{"productData":{...}}'
```

Response:
```json
{
  "success": true,
  "productId": "cuid1",
  "listingId": "cuid2",
  "affiliateId": "cuid3"
}
```

## Troubleshooting

### SCRAPER_API_BASE_URL not configured
- Ensure `.env` has `SCRAPER_API_BASE_URL=http://localhost:8010`
- Start scraper server: `python -m cekdulu_scraper.server`

### Import returns empty data or fails
- Check Shopee URL is valid product page
- Check scraper server is running and healthy: `curl http://localhost:8010/docs`
- If Shopee blocks server (403), configure proxy in `.env`:
  ```
  SCRAPER_PROXY_URL=http://username:password@host:port
  ```

### Product not showing on website after save
- Check product status is PUBLISHED (admin can edit)
- Check product slug is unique
- Verify ProductPrice exists for the product

## Future Enhancements
- [ ] Support Tokopedia, Lazada, Blibli URL imports
- [ ] Bulk import via CSV
- [ ] Schedule periodic price updates for imported products
- [ ] Image upload and gallery
- [ ] Admin approval workflow before publish
- [ ] Import history tracking and rollback
- [ ] Webhook integration for price change alerts

## Files Modified/Created

### Backend
- `apps/api/src/modules/product-import/product-import.module.ts` (new)
- `apps/api/src/modules/product-import/product-import.controller.ts` (new)
- `apps/api/src/modules/product-import/product-import.service.ts` (new)
- `apps/api/src/app.module.ts` (modified - added ProductImportModule)

### Scraper
- `apps/scraper/src/cekdulu_scraper/server.py` (new - FastAPI HTTP server)
- `apps/scraper/src/cekdulu_scraper/workers/shopee.py` (modified - added scrape_product method)
- `apps/scraper/pyproject.toml` (modified - added fastapi, uvicorn deps)

### Frontend
- `apps/web/app/admin/page.tsx` (modified - added import UI/modal and handlers)
- `README.md` (modified - added scraper server setup docs)

## Testing Checklist
- [x] API module compiles and registers routes
- [x] Web app builds with import modal
- [x] Scraper HTTP server runs without errors
- [x] Marketplace detection works
- [x] Product deduplication prevents duplicates
- [x] Affiliate links auto-created
- [ ] End-to-end: URL → fetch → preview → save → product visible

## Notes
- Feature focuses on curated imports, not bulk scraping
- Reduces reliance on marketplace anti-bot issues
- Products default to DRAFT status; admin must approve/publish manually
- All imported data is logged in ScrapedProduct for audit trail
- Proxy support included for anti-bot circumvention
