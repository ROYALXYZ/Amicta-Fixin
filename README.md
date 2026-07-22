# Amicta Fixin

Multi-tenant maintenance ticketing platform for residents, admins, technicians, and platform owners.

Stack: Laravel 12, PHP 8.2+, Inertia React, TypeScript, Tailwind CSS, PostgreSQL/SQLite, Laravel Reverb.

## Requirements

- PHP 8.2+
- Composer 2+
- Node.js 20+
- npm
- Git
- SQLite for the simplest local setup, or PostgreSQL for the shared/demo setup
- `cloudflared` only when connecting to PostgreSQL through Cloudflare Tunnel

## Windows Installation

### Install with Chocolatey

Open PowerShell as Administrator:

```powershell
choco install php composer nodejs-lts git cloudflared -y
refreshenv
```

Verify:

```powershell
php -v
composer --version
node --version
npm --version
git --version
cloudflared --version
```

### Install without Chocolatey

Install manually from the official sites:

- PHP: https://windows.php.net/download/
- Composer: https://getcomposer.org/download/
- Node.js LTS: https://nodejs.org/
- Git: https://git-scm.com/download/win
- cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

After installation, reopen PowerShell so PATH changes take effect.

If `winget` is available, cloudflared can also be installed with:

```powershell
winget install --id Cloudflare.cloudflared
```

## Clone and Install

```powershell
git clone https://github.com/ROYALXYZ/Amicta-Fixin.git
cd Amicta-Fixin\app
composer install
npm install
Copy-Item .env.example .env
php artisan key:generate
```

There is no `npm run install` script. Frontend dependencies are installed with `npm install` inside `app/`.

## Environment

Edit `app/.env`. Never commit this file.

### Local SQLite

Set:

```env
DB_CONNECTION=sqlite
```

Create the database and seed demo data:

```powershell
New-Item -ItemType File -Path database\database.sqlite -Force
php artisan migrate --seed
```

For local tenant subdomains:

```env
TENANCY_BASE_DOMAIN=localhost
```

### PostgreSQL through Cloudflare Tunnel

Use this when the PostgreSQL server is published by a Cloudflare Tunnel route such as:

```text
ps.example.com -> tcp://postgres-benchmark:5432
```

Terminal 1: keep the local TCP bridge running:

```powershell
cloudflared access tcp --hostname ps.example.com --url localhost:15432
```

Terminal 2: configure `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=15432
DB_DATABASE=fixin_benchmark
DB_USERNAME=<postgres_username>
DB_PASSWORD=<postgres_password>
```

`15432` is the local listener port. The remote PostgreSQL service still listens on `5432`.

Clear cached Laravel config after changing `.env`:

```powershell
php artisan optimize:clear
```

Verify the connection:

```powershell
php artisan tinker
```

```php
DB::connection()->getPdo();
DB::select('select 1 as ok');
exit
```

Expected: PostgreSQL PDO connection and `ok = 1`.

Run Artisan commands such as migration status from PowerShell, not inside Tinker:

```powershell
php artisan migrate:status
```

## Photo Storage

Photo uploads use a private Supabase Storage bucket through its S3-compatible endpoint. Leave these blank for SQLite work that does not upload photos:

```env
SUPABASE_S3_KEY=
SUPABASE_S3_SECRET=
SUPABASE_S3_REGION=us-east-1
SUPABASE_S3_BUCKET=ticket-photos
SUPABASE_S3_ENDPOINT=
```

Configure the values, create the private `ticket-photos` bucket, then run:

```powershell
php artisan optimize:clear
```

## Run the Application

### Separate terminals

Terminal 1:

```powershell
php artisan serve
```

Terminal 2:

```powershell
npm run dev
```

Terminal 3, for realtime features:

```powershell
php artisan reverb:start
```

Open:

```text
http://127.0.0.1:8000
```

### One command

```powershell
npm run dev:all
```

If ports `8000` or `5173` are busy, stop the old process or run the services separately with different ports.

## Demo Accounts

All demo accounts use:

```text
Password: password
```

| Role | Username | Organization |
| --- | --- | --- |
| Platform Owner | `platform-owner` | Global |
| Admin | `admin-amikom` | Amikom |
| Technician | `teknisi-amikom` | Amikom |
| Admin | `admin-astra` | Astra Motor |
| Technician | `teknisi-astra` | Astra Motor |

Phone login is also supported. Demo phone numbers are defined in `app/database/seeders/DemoTenantSeeder.php`.

## Verification

Run from `app/`:

```powershell
php artisan test
npm run build
git diff --check
```

Test database connectivity through the Cloudflare bridge:

```powershell
php artisan migrate:status
```

## Troubleshooting

### `cloudflared` is not recognized

```powershell
choco install cloudflared -y
refreshenv
cloudflared --version
```

Reopen PowerShell if `refreshenv` is unavailable.

### `cloudflared access tcp` starts but Laravel cannot connect

Keep the bridge terminal open. Confirm `.env` uses:

```env
DB_HOST=127.0.0.1
DB_PORT=15432
```

Then run:

```powershell
php artisan optimize:clear
php artisan migrate:status
```

### `php artisan serve` cannot bind to ports

Use another port:

```powershell
php artisan serve --host=127.0.0.1 --port=8080
```

Check processes using port 8000:

```powershell
netstat -ano | findstr ":8000"
```

### `@tabler/icons-react` cannot be resolved

Run inside `app/`:

```powershell
npm install
npm ls @tabler/icons-react
npm run dev
```

### `no such table` or missing migrations

```powershell
php artisan migrate --seed
```

### PostgreSQL authentication fails

Check `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`. The tunnel only forwards traffic; it does not change PostgreSQL credentials.

### Photos do not upload

Configure all required `SUPABASE_S3_*` values, verify the private bucket exists, then run:

```powershell
php artisan optimize:clear
```

## Security Notes

- Never commit `.env`, database credentials, S3 keys, or Cloudflare tokens.
- Prefer Cloudflare Access/WARP or a local `cloudflared access tcp` bridge for PostgreSQL.
- Do not expose PostgreSQL directly to the public Internet for production.
- Rotate demo credentials and tunnel credentials after a public competition demo.
