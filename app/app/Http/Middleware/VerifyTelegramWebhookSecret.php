<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyTelegramWebhookSecret
{
    public function handle(Request $request, Closure $next)
    {
        $secret = config('telegram.audit.webhook_secret');
        abort_if(blank($secret) || ! hash_equals($secret, (string) $request->header('X-Telegram-Bot-Api-Secret-Token')), 403);

        return $next($request);
    }
}
