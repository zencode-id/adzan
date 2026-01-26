# Mosque Display - Cloudflare Workers API

API backend untuk Mosque Display App menggunakan Cloudflare Workers + D1.

## Prerequisites

1. Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
2. Login ke Cloudflare: `npx wrangler login`

## Setup D1 Database

```bash
# 1. Buat database D1
npx wrangler d1 create mosque-db

# 2. Copy database_id dari output dan paste ke wrangler.toml
# Contoh output:
# Created D1 database: mosque-db
# Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 3. Jalankan migrasi (local development)
npm run db:migrate

# 4. Jalankan migrasi (production)
npm run db:migrate:prod
```

## Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev
# Server berjalan di http://localhost:8787
```

## Deployment

```bash
# Deploy ke Cloudflare Workers
npm run deploy
```

## API Endpoints

| Endpoint               | Method   | Description           |
| ---------------------- | -------- | --------------------- |
| `/`                    | GET      | API info              |
| `/api/mosque`          | GET/PUT  | Pengaturan masjid     |
| `/api/jadwal`          | GET      | Jadwal sholat         |
| `/api/announcements`   | CRUD     | Pengumuman            |
| `/api/display-content` | CRUD     | Konten display        |
| `/api/prayer-settings` | GET/PUT  | Pengaturan kalkulasi  |
| `/api/system-events`   | GET/POST | Log sistem            |
| `/api/sync/push`       | POST     | Push data dari client |
| `/api/sync/pull`       | POST     | Pull data ke client   |
| `/api/sync/status`     | GET      | Status server         |

## Cloudflare Pages Integration

Untuk deploy frontend ke Cloudflare Pages:

1. Push kode ke GitHub
2. Di Cloudflare Dashboard:
   - Pages → Create a project → Connect to Git
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `client`

3. Set environment variables:
   - `VITE_API_URL` = `https://your-worker.workers.dev`

## Struktur Project

```
worker/
├── src/
│   └── index.ts      # Hono API (main entry)
├── migrations/
│   └── 0001_init.sql # D1 schema
├── wrangler.toml     # Cloudflare config
├── package.json
└── tsconfig.json
```
