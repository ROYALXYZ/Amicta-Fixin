# PRD: Telegram Notification dan Audit Assistant

## 1. Ringkasan

FixIn membutuhkan dua bot Telegram terpisah:

1. **Bot Notifikasi Laporan** mengirim notifikasi saat laporan baru masuk kepada admin.
2. **Bot Audit Assistant** mengirim log aktivitas penting user, teknisi/tukang, dan admin; menyediakan pencarian, rekap, dan pada fase lanjutan tanya-jawab berbasis AI.

Database aplikasi tetap menjadi sumber audit resmi. Telegram adalah kanal distribusi dan antarmuka operasional, bukan database utama.

## 2. Masalah

- Admin perlu mengetahui laporan baru tanpa terus membuka dashboard.
- Aktivitas user, teknisi, dan admin perlu dapat ditelusuri berdasarkan pelaku, tiket, waktu, role, dan jenis aksi.
- Audit manual melalui tabel aplikasi memerlukan waktu untuk pencarian dan penyusunan rekap.
- Ringkasan otomatis dapat membantu audit, tetapi harus berbasis data aplikasi yang terotorisasi dan terstruktur.

## 3. Tujuan

- Admin menerima notifikasi laporan baru secara cepat melalui Telegram.
- Aktivitas penting seluruh role operasional tersimpan sebagai audit log terstruktur.
- Admin berwenang dapat mencari log dan meminta rekap melalui Bot Audit.
- Kegagalan Telegram tidak menggagalkan transaksi utama aplikasi.
- AI, jika diaktifkan, hanya merangkum hasil query yang sudah dibatasi aksesnya.

## 4. Non-goals

- Telegram menjadi sumber kebenaran audit.
- Mencatat setiap page view, refresh, filter, atau klik UI.
- Mengirim password, token, session, kredensial, foto privat, atau data sensitif penuh ke Telegram.
- Memberi AI akses SQL bebas atau akses database langsung.
- Membuat perubahan tiket melalui chat pada MVP.
- Menggabungkan dua bot menjadi satu identitas.
- Menambahkan WhatsApp, email, atau push notification.

## 5. Pengguna dan Hak Akses

| Aktor | Akses |
| --- | --- |
| Admin Organisasi | Menerima laporan organisasi sendiri; memakai pencarian/rekap audit organisasi sendiri. |
| Platform Owner | Mengelola konfigurasi bot lintas organisasi hanya bila fitur tersebut memang disediakan oleh aplikasi. |
| Penghuni | Tidak memiliki akses ke bot audit. Aktivitasnya tetap dicatat sesuai kebijakan audit. |
| Teknisi/Tukang | Tidak memiliki akses ke bot audit. Aktivitasnya tetap dicatat sesuai kebijakan audit. |
| Telegram Bot | Mengirim pesan dan menerima command sesuai konfigurasi; bukan user aplikasi. |

Bot Audit wajib memverifikasi pasangan `telegram_user_id` dan `telegram_chat_id`. Chat ID saja tidak cukup bila grup berisi pihak yang tidak berwenang.

## 6. Scope MVP

### 6.1 Bot Notifikasi Laporan

- Mengirim pesan ketika laporan baru berhasil tersimpan dan transaksi database sudah commit.
- Memuat minimal nomor tiket, organisasi, lokasi, kategori, prioritas/status awal, pelapor yang sudah direduksi bila perlu, dan waktu.
- Mengirim ke chat admin yang sesuai organisasi.
- Mendukung laporan resident dan laporan urgent anonim.
- Tidak mengirim foto privat pada MVP.
- Menggunakan queue; kegagalan pengiriman dicatat dan dapat diulang.

Contoh pesan:

```text
LAPORAN BARU #1042
Organisasi: AMIKOM
Lokasi: Gedung A / Ruang 203
Kategori: Listrik
Status: MENUNGGU_DISPATCH
Pelapor: Budi
Waktu: 23 Jul 2026 14:30
```

### 6.2 Bot Audit Assistant

- Mencatat aktivitas penting dari user/resident, teknisi, admin, dan sistem.
- Mengirim log aktivitas terpilih ke chat audit setelah transaksi commit.
- Menyediakan command deterministik sebelum AI:

```text
/today
/ticket 1042
/user budi
/technician andi
/search laporan dibatalkan
/recap today
/recap 2026-07-01 2026-07-23
/stats month
/help
```

- Membatasi hasil berdasarkan organisasi admin yang sedang terautentikasi di konfigurasi Telegram.
- Menampilkan waktu, role, pelaku, aksi, subject, tiket, dan ringkasan metadata aman.
- Menyediakan pagination atau batas hasil agar pesan Telegram tidak terlalu panjang.
- Menangani input tidak valid dengan pesan bantuan, bukan error teknis.

### 6.3 Aktivitas yang Wajib Dicatat

| Role | Aktivitas |
| --- | --- |
| User/Resident | Membuat laporan; membatalkan laporan bila diizinkan; perubahan profil penting. |
| Teknisi/Tukang | Menerima assignment; mulai pekerjaan; menambah catatan; upload bukti; menyelesaikan pekerjaan. |
| Admin | Assign teknisi; ubah prioritas; batalkan tiket; bulk assign/cancel; kelola teknisi; kelola gedung/unit; perubahan akun penting. |
| Sistem | Laporan urgent anonim; status transition; pengiriman Telegram berhasil/gagal; retry/failure job. |

Login sukses, login gagal berulang, password reset, dan perubahan role dapat dicatat sebagai event keamanan bila dibutuhkan.

### 6.4 Aktivitas yang Tidak Wajib Dicatat

- Membuka halaman.
- Refresh halaman.
- Membuka modal.
- Mengubah filter atau pagination.
- Setiap gerakan mouse atau klik yang tidak menghasilkan perubahan bisnis.

## 7. Data dan Model Audit

Tambahkan tabel `activity_logs` sebagai append-only audit trail.

| Kolom | Ketentuan |
| --- | --- |
| `id` | Primary key. |
| `organization_id` | Wajib untuk aktivitas tenant; nullable hanya untuk event platform yang memang lintas tenant. |
| `actor_id` | Nullable untuk sistem/urgent anonim; foreign key bila tersedia. |
| `actor_role` | `resident`, `technician`, `admin`, `platform_owner`, atau `system`. |
| `action` | Kode stabil, misalnya `ticket.created`, `ticket.assigned`. |
| `subject_type` | Model yang terdampak, misalnya `ticket` atau `user`. |
| `subject_id` | ID subject jika tersedia. |
| `description` | Ringkasan manusiawi tanpa secret/PII berlebihan. |
| `metadata` | JSON aman, hanya field relevan sebelum/sesudah. |
| `ip_address` | Opsional, mengikuti kebijakan privasi. |
| `user_agent` | Opsional, hanya bila ada kebutuhan audit. |
| `created_at` | Waktu server dalam UTC; tampilkan timezone konfigurasi saat dikirim. |

Index minimum:

- `(organization_id, created_at)`
- `(organization_id, actor_id, created_at)`
- `(organization_id, action, created_at)`
- `(organization_id, subject_type, subject_id, created_at)`


## 8. Kode Aktivitas Minimum

```text
ticket.created
ticket.assigned
ticket.priority_changed
ticket.started
ticket.note_added
ticket.photo_uploaded
ticket.completed
ticket.cancelled
technician.created
technician.updated
technician.deactivated
building.created
building.updated
building.deactivated
unit.created
unit.updated
unit.deactivated
user.profile_updated
auth.login_failed_threshold
telegram.notification_sent
telegram.notification_failed
```

Kode harus stabil dan digunakan oleh backend, query bot, test, serta rekap. Jangan memakai teks UI sebagai identifier.

## 9. Arsitektur Teknis

```text
Business action
→ DB transaction
→ activity_logs / ticket history
→ commit
→ queued notification jobs
→ Telegram Bot API
```

- Gunakan Laravel Notification atau service internal yang tipis; tidak perlu dependency Telegram tambahan pada MVP.
- Gunakan Laravel HTTP client ke Telegram Bot API.
- Notification/job memakai queue database yang sudah tersedia.
- Dispatch dilakukan setelah commit agar pesan tidak menyatakan laporan sukses saat transaksi rollback.
- Timeout dan retry wajib dikonfigurasi.
- Exception Telegram tidak boleh membatalkan create/dispatch/start/complete/cancel.
- Job harus idempotent agar retry tidak menggandakan pesan tanpa kontrol.
- Bot token tidak boleh masuk source control, log aplikasi, atau activity log.

Environment minimum:

```env
TELEGRAM_REPORT_BOT_TOKEN=
TELEGRAM_REPORT_CHAT_ID=
TELEGRAM_AUDIT_BOT_TOKEN=
TELEGRAM_AUDIT_CHAT_ID=
TELEGRAM_AUDIT_ALLOWED_USER_IDS=
TELEGRAM_AUDIT_TIMEZONE=Asia/Jakarta
TELEGRAM_ENABLED=false
```

Untuk multi-tenant produksi, konfigurasi chat harus dapat dipetakan per `organization_id`; jangan mengandalkan satu chat global bila data tenant dapat tercampur.

## 10. Format Pesan Audit

```text
[23 Jul 2026 14:40:15 WIB]
ADMIN · Sinta
ACTION: ticket.assigned
Tiket: #1042
Detail: ditugaskan kepada Andi; prioritas TINGGI
```

Aturan format:

- Maksimal panjang pesan mengikuti batas Telegram; pecah hasil panjang menjadi beberapa pesan.
- Escape Markdown/HTML sesuai mode parser yang dipakai.
- Waktu server disimpan UTC dan ditampilkan dalam timezone konfigurasi.
- Deskripsi tidak boleh memuat password, token, signed URL, atau data privat foto.
- Nomor telepon ditampilkan sebagian atau pseudonym bila tidak diperlukan.

## 11. Fase AI

AI bukan bagian dari acceptance MVP dasar. AI ditambahkan setelah command query deterministik stabil.

Input AI:

- Pertanyaan admin.
- Dataset hasil query terotorisasi dan dibatasi tanggal/jumlah/organisasi.
- Kamus kode aktivitas dan status tiket.

Output AI:

- Ringkasan bahasa Indonesia.
- Daftar fakta dengan waktu dan tiket.
- Indikasi data tidak cukup atau ambigu.
- Link/ID tiket untuk verifikasi di dashboard.

Guardrail:

- AI tidak boleh membuat atau mengubah data.
- AI tidak boleh menjalankan SQL mentah.
- AI tidak boleh melewati tenant scope atau role scope.
- AI tidak boleh mengarang fakta; jika data tidak tersedia, jawab tidak ditemukan.
- Prompt dan response tidak boleh menyimpan secret.
- Panggilan AI dicatat sebagai audit event tanpa menyimpan data sensitif penuh.
- Gunakan redaction sebelum data dikirim ke provider AI.
- Sediakan fallback ke hasil query mentah jika provider AI gagal.

Contoh pertanyaan:

```text
Apa saja kegiatan Andi hari ini?
Ringkas laporan yang dibatalkan minggu ini.
Siapa yang paling banyak menyelesaikan tiket bulan ini?
Apakah ada tiket yang lama tidak berubah status?
```

## 12. Keamanan dan Privasi

- Bot Audit hanya menerima command dari user ID yang di-allowlist.
- Bot tidak boleh memproses command dari private chat/group yang tidak terdaftar.
- Chat ID, user ID, token, dan mapping organisasi disimpan di environment/secret manager.
- Validasi tenant dilakukan server-side untuk setiap query.
- Audit log append-only; tidak tersedia endpoint hapus dari user biasa.
- Terapkan redaction PII dan kebijakan retention yang disepakati.
- Audit log tidak boleh diubah oleh actor yang sedang diaudit melalui request bisnis yang sama.
- Telegram dianggap kanal pihak ketiga; data yang dikirim harus minimum necessary.
- Jika bot atau token bocor, revoke token melalui BotFather dan ganti secret.
- Production wajib menggunakan HTTPS saat aplikasi memanggil Telegram Bot API.

## 13. Acceptance Criteria MVP

1. Setelah resident membuat laporan dan transaksi commit, Bot Notifikasi mengirim satu pesan ke chat organisasi yang benar.
2. Setelah laporan urgent anonim dibuat, Bot Notifikasi mengirim pesan tanpa mengklaim ada user resident.
3. Kegagalan Telegram tidak membuat request pembuatan laporan gagal dan tidak menghapus data laporan.
4. Queue retry dapat memproses pengiriman yang gagal tanpa membuat duplicate message yang tidak terkendali.
5. Setiap create laporan menghasilkan satu `activity_logs` dengan actor dan organization scope yang benar.
6. Assignment, start, note, completion, cancellation, master-data changes menghasilkan audit log sesuai action code.
7. Setiap audit log tenant memiliki `organization_id` yang valid dan tidak dapat dibaca lintas tenant.
8. Bot Audit menolak user ID/chat ID yang tidak diizinkan.
9. `/ticket`, `/today`, `/search`, dan `/recap` mengembalikan hasil yang terfilter organisasi dan periode.
10. Hasil panjang dipaginasi/dipecah tanpa error Telegram.
11. Log Telegram tidak menampilkan password, token, signed URL, atau foto privat.
12. Test mencakup success, queue failure, unauthorized bot user, tenant isolation, dan retry/idempotency.
13. AI belum wajib untuk MVP; command deterministik tetap berfungsi tanpa provider AI.

## 14. Acceptance Criteria Fase AI

1. Pertanyaan AI hanya dapat dijalankan oleh admin yang diizinkan.
2. Dataset yang dikirim ke AI telah dibatasi tenant, waktu, jumlah row, dan field.
3. AI tidak memiliki tool SQL atau write access.
4. Jawaban menyertakan periode/data scope dan referensi tiket bila relevan.
5. Provider timeout/error menghasilkan fallback yang aman.
6. Prompt injection dari isi laporan tidak dapat mengubah aturan akses.
7. Penggunaan AI dapat dimatikan melalui environment variable tanpa merusak bot audit dasar.

## 15. Rencana Implementasi Berurutan

### Slice 1: Audit Foundation

- Migration `activity_logs`.
- Model, enum/action constants, factory bila dibutuhkan.
- Helper/service `AuditLogger` tipis.
- Catat event tiket utama.
- Test tenant scope dan append-only behavior.

### Slice 2: Bot Notifikasi Laporan

- Config Telegram dan `.env.example`.
- HTTP client/service Bot API.
- Notification/job laporan baru.
- Dispatch after commit.
- Queue retry, timeout, idempotency.
- Test `Http::fake()`.

### Slice 3: Bot Audit Logs

- Audit event listener/dispatch untuk aktivitas penting.
- Formatter pesan.
- Mapping organisasi ke chat audit.
- Allowlist Telegram user/chat.
- Pengiriman queued dan failure logging.

### Slice 4: Search dan Recap Deterministik

- Command parser.
- Query repository/service dengan tenant scope.
- `/today`, `/ticket`, `/search`, `/recap`, `/stats`.
- Pagination dan rate limit.
- Feature/integration test.

### Slice 5: AI Assistant

- Provider abstraction hanya saat provider dipilih.
- Context builder dari hasil query.
- Redaction, token budget, timeout, fallback.
- Read-only tools/query path.
- Prompt-injection and authorization tests.

## 16. Observability dan Operasional

- Log jumlah job Telegram sukses, gagal, retry, dan permanently failed.
- Simpan `telegram.message_id`/delivery reference bila aman dan diperlukan untuk idempotency.
- Sediakan command/status internal untuk memeriksa konfigurasi tanpa menampilkan token.
- Monitor queue worker karena pengiriman bergantung pada queue.
- Sediakan feature flag `TELEGRAM_ENABLED` dan flag AI terpisah.
- Alert bila failure rate melewati ambang yang ditentukan.
- Dokumentasikan prosedur revoke dan rotate token.

## 17. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Telegram down/rate limit | Queue, retry backoff, failure monitoring, transaksi utama tetap sukses. |
| Audit log menjadi spam | Catat business events saja; bukan semua UI activity. |
| Data tenant tercampur | Mapping chat per organisasi dan query scope wajib. |
| Bot token bocor | `.env`/secret manager, redaction, rotate via BotFather. |
| Pesan audit dihapus di Telegram | DB append-only tetap menjadi sumber resmi. |
| AI mengarang atau bocor data | Context terbatas, read-only, redaction, citation, fallback. |
| Duplicate notification | Idempotency key berbasis event/job dan delivery reference. |
| Queue worker mati | Health check, failed jobs, dokumentasi `queue:work`. |
| Retention/PII tidak jelas | Tentukan kebijakan sebelum production; minimalkan field. |

## 18. Open Questions

- Apakah setiap organisasi memiliki grup Telegram sendiri untuk laporan dan audit?
- Admin mana yang boleh menerima Bot Notifikasi dan memakai Bot Audit?
- Apakah satu admin boleh mengakses audit lebih dari satu organisasi?
- Berapa lama audit log harus disimpan?
- Apakah IP address dan user agent diperlukan untuk kebutuhan akademik/audit?
- Provider AI apa yang disetujui, dan apakah data laporan boleh dikirim ke provider tersebut?
- Apakah Bot Audit hanya read-only pada MVP, atau kelak boleh melakukan aksi setelah konfirmasi?
- Zona waktu resmi laporan dan audit: `Asia/Jakarta` atau konfigurasi per organisasi?
- Threshold rate limit dan retention message Telegram yang diinginkan?

## 19. Definition of Done

- Migration, model, dan audit service telah diuji.
- Semua event MVP tercatat dengan actor, organization, subject, action, dan timestamp.
- Bot Notifikasi dan Bot Audit memakai token berbeda.
- Queue worker, retry, failure handling, dan idempotency terverifikasi.
- Tenant isolation dan allowlist bot terverifikasi dengan test.
- Tidak ada secret dalam repository, response, atau log.
- Command search/recap dasar berfungsi tanpa AI.
- AI tetap dimatikan sampai provider, privacy, dan guardrail disetujui.
- Dokumentasi setup lokal SQLite dan production PostgreSQL diperbarui.
- `php artisan test`, `npm run build`, dan `git diff --check` lulus.
