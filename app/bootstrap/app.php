<?php

use App\Http\Middleware\EnsureUserBelongsToOrganization;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\AddServerTiming;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ResolveOrganizationFromSubdomain;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*', headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR | \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO);
        $middleware->redirectGuestsTo('/login');
        
        $middleware->web(prepend: [
            \App\Http\Middleware\ForceHttpsScheme::class,
            AddServerTiming::class,
        ]);
        $middleware->web(append: [
            ResolveOrganizationFromSubdomain::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'tenant.user' => EnsureUserBelongsToOrganization::class,
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $exception, $request) {
            if ($request->is('up') || $request->expectsJson() || ! $request->isMethod('GET')) {
                return null;
            }

            // Let Laravel handle authentication exceptions (redirect to login)
            if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
                return null;
            }

            $status = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;
            $copy = match ($status) {
                403 => ['Akses ditolak', 'Anda tidak memiliki izin untuk membuka halaman ini.', 'Akun Anda tidak memiliki role atau akses tenant yang diperlukan.'],
                404 => ['Halaman tidak ditemukan', 'Alamat yang dibuka tidak tersedia atau sudah dipindahkan.', 'Periksa URL, hostname tenant, atau gunakan tombol Beranda untuk kembali.'],
                419 => ['Sesi kedaluwarsa', 'Form atau halaman ini sudah terlalu lama terbuka.', 'Muat ulang halaman lalu kirim ulang permintaan Anda.'],
                429 => ['Terlalu banyak permintaan', 'Permintaan Anda terlalu cepat atau terlalu banyak.', 'Tunggu sebentar sebelum mencoba lagi.'],
                503 => ['Layanan tidak tersedia', 'FixIn sedang menjalani pemeliharaan atau belum siap menerima permintaan.', 'Coba lagi beberapa saat lagi.'],
                default => ['Terjadi kesalahan', 'FixIn mengalami kendala saat memproses permintaan.', 'Coba muat ulang halaman. Jika berulang, laporkan waktu dan halaman ini kepada admin.'],
            };

            return \Inertia\Inertia::render('Errors/Show', ['status' => $status, 'title' => $copy[0], 'message' => $copy[1], 'detail' => $copy[2]])->toResponse($request)->setStatusCode($status);
        });
    })->create();
