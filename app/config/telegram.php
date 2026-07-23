<?php

return [
    'enabled' => (bool) env('TELEGRAM_ENABLED', false),
    'timeout' => (int) env('TELEGRAM_TIMEOUT', 10),
    'poll_timeout' => (int) env('TELEGRAM_POLL_TIMEOUT', 20),
    'report' => [
        'token' => env('TELEGRAM_REPORT_BOT_TOKEN'),
        'chat_ids' => json_decode((string) env('TELEGRAM_REPORT_CHAT_IDS', '{}'), true) ?: [],
    ],
    'audit' => [
        'token' => env('TELEGRAM_AUDIT_BOT_TOKEN'),
        'chat_ids' => json_decode((string) env('TELEGRAM_AUDIT_CHAT_IDS', '{}'), true) ?: [],
        'allowed_user_ids' => array_values(array_filter(array_map('trim', explode(',', (string) env('TELEGRAM_AUDIT_ALLOWED_USER_IDS', ''))))),
        'webhook_secret' => env('TELEGRAM_AUDIT_WEBHOOK_SECRET'),
    ],
    'timezone' => env('TELEGRAM_AUDIT_TIMEZONE', 'Asia/Jakarta'),
];
