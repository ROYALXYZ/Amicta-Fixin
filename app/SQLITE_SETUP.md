# SQLite Local Setup

## `.env`

```env
DB_CONNECTION=sqlite
# DB_DATABASE unset: Laravel uses database_path('database.sqlite') automatically.
```

`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` PostgreSQL tidak diperlukan saat memakai SQLite. Hapus atau komentari nilai PostgreSQL agar tidak membingungkan.

## Setelah Mengubah `.env`

Jalankan dari folder `app`:

```powershell
New-Item -ItemType File -Force "database\database.sqlite"
php artisan config:clear
php artisan migrate --seed
```

`migrate --seed` membuat schema dan data demo. Jika database SQLite sudah berisi data, gunakan:

```powershell
php artisan migrate
```

## Verifikasi

```powershell
php artisan tinker --execute="dump(config('database.default')); dump(config('database.connections.sqlite.database')); dump(App\Models\Organization::pluck('slug')->all());"
```

Expected:

```text
sqlite
<absolute path ke database/database.sqlite>
amikom
astra-motor
```

## Jalankan Aplikasi

Terminal 1:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:

```powershell
npm run dev
```

Realtime opsional:

```powershell
php artisan reverb:start
```

Buka:

```text
http://amikom.localhost:8000
```

Jangan gunakan `php artisan migrate:fresh` kecuali database lokal boleh dihapus.
