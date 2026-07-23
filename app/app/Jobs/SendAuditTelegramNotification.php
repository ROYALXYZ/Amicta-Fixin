<?php

namespace App\Jobs;

use App\Models\ActivityLog;
use App\Support\AuditMessageFormatter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendAuditTelegramNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(public readonly int $activityLogId) {}

    public function handle(): void
    {
        $log = ActivityLog::query()->with('actor')->find($this->activityLogId);
        if (! $log) return;

        $chatId = config("telegram.audit.chat_ids.{$log->organization_id}");
        if (blank($chatId)) return;

        $text = AuditMessageFormatter::format($log);

        SendTelegramMessage::dispatch('audit', (string) $chatId, $text);
    }
}
