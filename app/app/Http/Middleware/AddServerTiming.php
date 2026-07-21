<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AddServerTiming
{
    public function handle(Request $request, Closure $next): Response
    {
        $startedAt = hrtime(true);
        $databaseMs = 0.0;
        DB::listen(function ($query) use (&$databaseMs): void {
            $databaseMs += $query->time;
        });
        $response = $next($request);

        if ($request->is('admin/*')) {
            $appMs = round((hrtime(true) - $startedAt) / 1_000_000, 1);
            $response->headers->set('Server-Timing', "app;dur={$appMs}, db;dur=".round($databaseMs, 1));
        }

        return $response;
    }
}
