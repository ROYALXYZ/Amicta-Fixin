<?php

namespace App\Jobs;

use App\Services\TelegramBot;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTelegramMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public readonly string $bot,
        public readonly string $chatId,
        public readonly string $text,
    ) {}

    public function handle(TelegramBot $telegram): void
    {
        $telegram->sendMessage((string) config("telegram.{$this->bot}.token"), $this->chatId, $this->text);
    }
}
