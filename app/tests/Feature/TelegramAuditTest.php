<?php

namespace Tests\Feature;

use App\Jobs\SendAuditTelegramNotification;
use App\Models\ActivityLog;
use App\Models\Organization;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class TelegramAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_logger_persists_tenant_scoped_activity_and_queues_audit_message(): void
    {
        config()->set('telegram.enabled', true);
        config()->set('telegram.audit.token', 'audit-token');
        Queue::fake();

        $organization = Organization::create(['name' => 'Audit Org', 'slug' => 'audit-org']);
        config()->set('telegram.audit.chat_ids', [$organization->id => '-1001']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $log = AuditLogger::record('ticket.created', 'Membuat laporan #1', $organization, $user, null, ['status' => 'WAITING_DISPATCH']);

        $this->assertDatabaseHas('activity_logs', [
            'id' => $log->id,
            'organization_id' => $organization->id,
            'actor_id' => $user->id,
            'action' => 'ticket.created',
        ]);
        Queue::assertPushed(SendAuditTelegramNotification::class, fn ($job) => $job->activityLogId === $log->id);
    }

    public function test_audit_webhook_rejects_wrong_secret_and_unauthorized_sender(): void
    {
        config()->set('telegram.audit.webhook_secret', 'correct-secret');
        config()->set('telegram.audit.chat_ids', ['1' => '-1001']);
        config()->set('telegram.audit.allowed_user_ids', ['42']);

        $this->postJson('/integrations/telegram/audit/webhook', [], ['X-Telegram-Bot-Api-Secret-Token' => 'wrong-secret'])->assertForbidden();

        $this->postJson('/integrations/telegram/audit/webhook', [
            'message' => ['chat' => ['id' => '-1001'], 'from' => ['id' => 99], 'text' => '/today'],
        ], ['X-Telegram-Bot-Api-Secret-Token' => 'correct-secret'])->assertOk();
    }

    public function test_activity_logs_are_not_visible_across_organizations(): void
    {
        $first = Organization::create(['name' => 'First Org', 'slug' => 'first-org']);
        $second = Organization::create(['name' => 'Second Org', 'slug' => 'second-org']);
        ActivityLog::create(['organization_id' => $first->id, 'actor_role' => 'ADMIN', 'action' => 'ticket.created', 'description' => 'first']);
        ActivityLog::create(['organization_id' => $second->id, 'actor_role' => 'ADMIN', 'action' => 'ticket.created', 'description' => 'second']);

        $this->assertSame(['first'], ActivityLog::where('organization_id', $first->id)->pluck('description')->all());
    }
}
