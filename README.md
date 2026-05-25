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

## Tutorial Menjalankan Aplikasi (Local)

### 1) Prasyarat
- Node.js 20+
- pnpm 9+
- Docker Desktop (untuk PostgreSQL, Redis, RabbitMQ)
- Python 3.12+ (opsional, jika ingin menjalankan scraper worker)

### 2) Install dependency
Jalankan dari root project:

```bash
pnpm install
```

### 3) Siapkan environment
Salin contoh env jika belum ada:

```bash
copy .env.example .env
```

Lalu pastikan file `apps/web/.env.local` tersedia (buat manual jika belum ada).

Pastikan nilai penting ini terisi benar (minimal):
- `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
- `DATABASE_URL=postgresql://cekdulu:cekdulu@127.0.0.1:5432/cekdulu?schema=public`
- `RABBITMQ_URL=amqp://guest:guest@localhost:5672`

### 4) Nyalakan service dependency

```bash
docker-compose up -d postgres redis rabbitmq
```

### 5) Sinkronisasi database Prisma

```bash
pnpm --filter @cekdulu/database exec prisma db push --accept-data-loss --skip-generate
pnpm --filter @cekdulu/database exec prisma generate
pnpm --filter @cekdulu/database exec prisma db seed
```

### 6) Jalankan API dan Web
Buka 2 terminal dari root project:

Terminal 1 (API):
```bash
pnpm --filter @cekdulu/api dev
```

Terminal 2 (Web):
```bash
pnpm --filter @cekdulu/web dev
```

### 7) Akses aplikasi
- Web: `http://localhost:3000`
- API health: `http://localhost:4000/api/health`

Login admin (hasil seed):
- Email: `admin@cekdulu.test`
- Password: `Admin12345!`

### 8) (Opsional) Jalankan scraper worker

```bash
cd apps/scraper
pip install -e .
# install playwright browsers once
python -m playwright install --with-deps
python -m playwright install chromium
# jalankan queue consumer (worker)
python -m cekdulu_scraper.main
```

### 9) (Opsional) Jalankan scraper HTTP server (untuk Import by URL)

Jika ingin fitur "Import Product by URL" bekerja secara interaktif di admin, jalankan scraper HTTP server yang menyediakan endpoint /product untuk mengambil detail produk.

```bash
cd apps/scraper
pip install -e .
python -m cekdulu_scraper.server
```

Pastikan `SCRAPER_API_BASE_URL` di `.env` menunjuk ke `http://localhost:8010` atau alamat server scraper Anda.

## Troubleshooting cepat
- Port 3000/4000 bentrok:
  - Hentikan proses yang pakai port, lalu jalankan ulang `pnpm --filter @cekdulu/web dev` atau `pnpm --filter @cekdulu/api dev`.
- Login `failed to fetch`:
  - Pastikan API hidup di `http://localhost:4000/api/health`.
  - Pastikan `NEXT_PUBLIC_API_URL` mengarah ke `http://localhost:4000/api`.
- Scraping Shopee selalu 0 item / job gagal:
  - Shopee sering memblokir traffic lokal/headless dengan anti-bot.
  - Set proxy di `.env`:
    - `SCRAPER_PROXY_URL=http://username:password@host:port`
  - Restart worker scraper setelah ubah env.
- Data admin tidak ada:
  - Jalankan ulang seed: `pnpm --filter @cekdulu/database exec prisma db seed`.
- Build web error cache `.next`:
  - Hapus folder `apps/web/.next`, lalu jalankan ulang build/dev.

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
