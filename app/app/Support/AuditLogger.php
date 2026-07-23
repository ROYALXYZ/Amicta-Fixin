<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\Organization;
use App\Models\User;
use App\Jobs\SendAuditTelegramNotification;

final class AuditLogger
{
    public static function record(
        string $action,
        string $description,
        ?Organization $organization = null,
        ?User $actor = null,
        ?object $subject = null,
        array $metadata = [],
        bool $notifyTelegram = true,
    ): ActivityLog {
        $log = ActivityLog::query()->create([
            'organization_id' => $organization?->id,
            'actor_id' => $actor?->id,
            'actor_role' => $actor?->role?->value ?? 'system',
            'action' => $action,
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description,
            'metadata' => $metadata ?: null,
        ]);

        if ($notifyTelegram && config('telegram.enabled') && filled(config('telegram.audit.token')) && filled(config("telegram.audit.chat_ids.{$log->organization_id}"))) {
            SendAuditTelegramNotification::dispatch($log->id)->afterCommit();
        }

        return $log;
    }
}
