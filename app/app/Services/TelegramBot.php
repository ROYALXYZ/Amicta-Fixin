<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

final class TelegramBot
{
    public function sendMessage(string $token, string|int $chatId, string $text): array
    {
        if (! config('telegram.enabled') || blank($token) || blank($chatId)) {
            return ['ok' => false, 'skipped' => true];
        }

        $response = Http::timeout(config('telegram.timeout', 10))
            ->retry(2, 250)
            ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
            ]);

        if ($response->failed() || ! $response->json('ok')) {
            throw new RuntimeException('Telegram sendMessage failed.');
        }

        return $response->json();
    }

    public function getUpdates(string $token, int $offset, int $timeout): array
    {
        if (blank($token)) return [];

        $response = Http::timeout($timeout + 5)->post("https://api.telegram.org/bot{$token}/getUpdates", [
            'offset' => $offset,
            'timeout' => $timeout,
            'allowed_updates' => ['message'],
        ]);

        if ($response->failed() || ! $response->json('ok')) {
            throw new RuntimeException('Telegram getUpdates failed.');
        }

        return $response->json('result', []);
    }
}
