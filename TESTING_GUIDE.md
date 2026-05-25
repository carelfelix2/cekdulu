# Testing the "Import Product by URL" Feature

## ✅ Current Stack Status

All services are now running:
- **API Server**: http://localhost:4000/api (NestJS, healthy ✓)
- **Web Server**: http://localhost:3000 (Next.js, compiled ✓)
- **Scraper HTTP Server**: http://localhost:8010 (FastAPI, listening ✓)
- **Database**: PostgreSQL (via docker-compose)
- **Cache/Queue**: Redis & RabbitMQ (via docker-compose)

## 🧪 Test 1: Scraper HTTP Server Health

### Via Terminal
```bash
curl -X POST http://localhost:8010/product \
  -H "Content-Type: application/json" \
  -d '{"url":"https://shopee.co.id/product/11611995/310289819"}'
```

Expected Response (if successful):
```json
{
  "productName": "...",
  "productUrl": "...",
  "price": 19900,
  "imageUrl": "https://...",
  "rating": 4.5,
  "soldCount": 100,
  "reviewCount": 50,
  "shopName": "...",
  "marketplace": "shopee",
  "itemId": "310289819",
  "shopId": "11611995"
}
```

### Via Browser (Swagger UI)
Navigate to: http://localhost:8010/docs
- Click "Try it out" on POST /product
- Paste a Shopee URL in the url field
- Click Execute

## 🧪 Test 2: API Endpoints

### Test Fetch Endpoint
```bash
curl -X POST http://localhost:4000/api/product-import/fetch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_AUTH_TOKEN>" \
  -d '{"url":"https://shopee.co.id/product/11611995/310289819"}'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "product": {
      "productName": "...",
      "productUrl": "...",
      "price": 19900,
      ...
    }
  }
}
```

### Test Save Endpoint
```bash
curl -X POST http://localhost:4000/api/product-import/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_AUTH_TOKEN>" \
  -d '{
    "productData": {
      "productName": "Test Product",
      "productUrl": "https://shopee.co.id/product/...",
      "price": 19900,
      "imageUrl": "https://...",
      "rating": 4.5,
      "soldCount": 100,
      "reviewCount": 50,
      "shopName": "Test Shop",
      "marketplace": "shopee",
      "itemId": "123456",
      "shopId": "789012"
    }
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "productId": "cuid_...",
    "listingId": "cuid_...",
    "affiliateId": "cuid_..."
  }
}
```

## 🧪 Test 3: Full Admin UI Flow (Recommended)

### Setup
1. Open **http://localhost:3000** in your browser
2. Navigate to **Admin Panel** (click Admin in header or go to `/admin`)
3. Login if prompted (example: admin@cekdulu.test / Admin12345!)

### Test Import Flow
1. **Find "Import product" button** in Quick Actions section (top of admin panel)
2. **Click "Import product"** → Modal appears with URL input field
3. **Paste a Shopee URL** (see examples below)
4. **Click "Fetch Product"** button
   - **Loading**: Spinner shows while fetching
   - **Success**: Product preview appears with:
     - Product image
     - Product name
     - Price
     - Shop name
     - Sold count & rating
     - Description
   - **Error**: Error message shows if URL is invalid or scraper fails
5. **Click "Save Product"** button
   - **Saving**: Spinner shows while saving to database
   - **Success**: Modal closes, product appears in admin Products table with status DRAFT or PUBLISHED
   - **Error**: Error message shows if save fails

### Verify Saved Product
After clicking "Save Product":
1. **In Admin Products Table**: 
   - Scroll down to see newly imported product
   - Verify status, name, marketplace, price
2. **On Website**:
   - Go to `/products` page or search for the product
   - Verify product is visible with correct details
3. **Check Affiliate Link**:
   - Admin → Products → Click product → Check Affiliate Links section
   - Verify affiliate link was created with shortCode and trackingCode

## 📌 Test URLs (Shopee Products)

Use these real Shopee URLs for testing:

### Example 1 (Electronics)
```
https://shopee.co.id/product/151485827/10949433639
```

### Example 2 (Fashion)
```
https://shopee.co.id/product/56097020/8798789789
```

### Example 3 (Direct Product Link Format)
```
https://shopee.co.id/-i.151485827.10949433639
```

**Note**: If Shopee returns 403 (blocked), you need to configure a proxy:
```bash
export SCRAPER_PROXY_URL="http://username:password@proxy:port"
# Then restart: python -m cekdulu_scraper.server
```

## 🔍 Debugging

### Check Scraper Server Logs
```bash
# If error occurs during fetch, check scraper console output for traceback
# Terminal running scraper will show any errors from Playwright or parsing
```

### Check API Logs
```bash
# API dev server (pnpm --filter @cekdulu/api dev) shows request logs
# Look for 201/200 on POST /product-import/fetch and POST /product-import/save
```

### Check Database
```bash
# Verify product was created:
SELECT id, name, slug, status FROM "Product" 
WHERE "createdAt" > now() - interval '5 minutes'
ORDER BY "createdAt" DESC LIMIT 1;

# Verify listing was created:
SELECT id, "productId", marketplace, "itemId", "productUrl" 
FROM "ProductListing" 
WHERE "createdAt" > now() - interval '5 minutes'
LIMIT 1;

# Verify affiliate link was created:
SELECT id, "productId", "shortCode", "trackingCode" 
FROM "AffiliateLink" 
WHERE "createdAt" > now() - interval '5 minutes'
LIMIT 1;
```

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "SCRAPER_API_BASE_URL not configured" | Env var missing | Add `SCRAPER_API_BASE_URL=http://localhost:8010` to `.env` |
| "Product fetch returns empty" | Scraper server not responding | Verify `netstat -ano \| Select-String "8010"` shows port listening |
| "403 Forbidden from Shopee" | Server detected as bot | Configure proxy in `.env` with `SCRAPER_PROXY_URL` |
| "Product save fails - duplicate" | URL already imported | Try importing a different URL |
| "Modal doesn't appear" | JavaScript error | Check browser console for errors (F12 → Console tab) |
| "Preview doesn't show" | API error from scraper | Check scraper server console for Python errors |

## ✅ Success Criteria

You'll know the feature is working when:
1. ✅ Paste Shopee URL → Click "Fetch Product"
2. ✅ Product preview appears with name, image, price
3. ✅ Click "Save Product"
4. ✅ Modal closes automatically
5. ✅ Product appears in admin Products table
6. ✅ Product is visible on website at `/products/[slug]`
7. ✅ Affiliate link created (visible in product details)
8. ✅ Database has product, listing, price snapshot, and affiliate records

## 📊 Data Flow Diagram

```
Admin Browser (http://localhost:3000/admin)
    ↓
    └─→ Click "Import product" button
        ↓
        Modal appears with URL input
        ↓
        Paste Shopee URL → Click "Fetch Product"
        ↓
API Server (http://localhost:4000/api/product-import/fetch)
        ↓
Scraper HTTP Server (http://localhost:8010/product)
        ↓
Playwright launches browser, scrapes product details
        ↓
Returns product JSON (name, price, image, seller, etc.)
        ↓
API returns product to frontend
        ↓
Modal shows preview (image, name, price, shop, sold/rating, description)
        ↓
Admin clicks "Save Product"
        ↓
API Server (POST /product-import/save)
        ↓
Checks for duplicates by URL and marketplace+itemId
        ↓
If new:
  - Creates Product record (name, slug, status=DRAFT/PUBLISHED)
  - Creates ProductListing (marketplace, itemId, productUrl, stock)
  - Creates ProductPrice (price snapshot, currency, timestamp)
  - Creates AffiliateLink (shortCode, trackingCode, redirectUrl)
  - Logs ScrapedProduct (raw import data for audit)
If duplicate:
  - Updates existing ProductListing
  - Creates new ProductPrice snapshot
        ↓
Returns productId, listingId, affiliateId to frontend
        ↓
Modal closes, product table refreshes
        ↓
Product visible in admin table and on website
```

## 📝 Notes

- **Status Field**: Imported products default to `DRAFT` status. Admin must set to `PUBLISHED` to appear on website (via status toggle in admin product editor or bulk action).
- **Affiliate Link**: Auto-generated with internal tracking. Clicking affiliate link redirects to original Shopee listing with tracking code in URL.
- **Deduplication**: System checks if product URL already exists in database. If yes, updates listing instead of creating duplicate.
- **Price History**: Each import creates a ProductPrice snapshot. Over time, creates a price history for trending/comparison.
- **Raw Data**: All import data logged in ScrapedProduct table for audit trail and future re-parsing if needed.
- **Marketplace Detection**: Currently supports Shopee. Other marketplaces (Tokopedia, Lazada, Blibli, Bukalapak) detected via hostname but need respective worker classes to fully scrape.

---

**Next Steps:**
1. Open http://localhost:3000/admin
2. Click "Import product"
3. Test with one of the provided URLs
4. Verify product appears and all data is correct
5. Report any issues or missing functionality
