# Amicta Fixin

Multi-tenant maintenance ticketing app. Laravel, Inertia, React, Tailwind, shadcn/ui.

## Requirements

- PHP 8.2+
- Composer 2+
- Node.js 20+
- npm
- SQLite for local development, or PostgreSQL for a Supabase-backed environment

## Local Installation

```bash
git clone https://github.com/ROYALXYZ/Amicta-Fixin.git
cd Amicta-Fixin/app
composer install
npm install
copy .env.example .env
php artisan key:generate
```

Create the local SQLite database:

```bash
type nul > database/database.sqlite
php artisan migrate --seed
```

Start the app in two terminals:

```bash
php artisan serve
```

```bash
npm run dev
```

Open `http://127.0.0.1:8000`.

## Environment Setup

Edit `app/.env`. This file is ignored by Git; do not commit it.

Local SQLite needs no database credentials:

```env
DB_CONNECTION=sqlite
```

For tenant subdomains locally:

```env
TENANCY_BASE_DOMAIN=localhost
```

Photo storage uses a private Supabase Storage bucket through its S3-compatible endpoint. Fill these only when configuring Supabase; keep values blank for local work that does not upload photos:

```env
SUPABASE_S3_KEY=
SUPABASE_S3_SECRET=
SUPABASE_S3_REGION=us-east-1
SUPABASE_S3_BUCKET=ticket-photos
SUPABASE_S3_ENDPOINT=
```

After changing `.env`:

```bash
php artisan config:clear
```

## Verification

```bash
php artisan test
npm run build
```

## FAQ

### `composer install` fails

Confirm PHP 8.2+ and required PHP extensions are enabled. Run `php -v`.

### `npm run dev` fails

Use Node.js 20+ and rerun `npm install` inside `app/`.

### `no such table` error

Run `php artisan migrate --seed` from `app/`.

### Photos do not upload

Configure the five `SUPABASE_S3_*` values in `app/.env`, create the private `ticket-photos` bucket, then run `php artisan config:clear`.

### Can I commit `.env`?

No. Keep credentials only in `app/.env`; use `app/.env.example` as the blank template.
