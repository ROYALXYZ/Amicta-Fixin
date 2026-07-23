<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\TelegramAuditController;
use App\Services\TelegramBot;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('telegram:audit-poll {--once : Process available updates once and exit}', function (TelegramBot $telegram, TelegramAuditController $audit) {
    $token = (string) config('telegram.audit.token');
    $offset = 0;
    $timeout = max(1, (int) config('telegram.poll_timeout', 20));

    do {
        foreach ($telegram->getUpdates($token, $offset, $timeout) as $update) {
            $offset = ((int) ($update['update_id'] ?? 0)) + 1;
            $audit->handleUpdate($update, $telegram);
        }
    } while (! $this->option('once'));
})->purpose('Poll Telegram Audit bot updates without a public webhook');
