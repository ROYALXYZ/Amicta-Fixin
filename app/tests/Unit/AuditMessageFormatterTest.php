<?php

namespace Tests\Unit;

use App\Models\ActivityLog;
use App\Support\AuditMessageFormatter;
use Tests\TestCase;

class AuditMessageFormatterTest extends TestCase
{
    public function test_cancelled_ticket_is_written_as_a_human_sentence(): void
    {
        config()->set('telegram.timezone', 'Asia/Jakarta');
        $log = new ActivityLog([
            'actor_role' => 'ADMIN',
            'action' => 'ticket.cancelled',
            'description' => 'Membatalkan tiket #42',
            'metadata' => ['reason' => 'Laporan tidak valid'],
        ]);
        $log->created_at = now();

        $message = AuditMessageFormatter::format($log);

        $this->assertStringContainsString('membatalkan Tiket #42', $message);
        $this->assertStringContainsString('Laporan tidak valid', $message);
        $this->assertStringNotContainsString('ticket.cancelled', $message);
    }

    public function test_reassigned_ticket_is_written_as_a_human_sentence(): void
    {
        $log = new ActivityLog([
            'actor_role' => 'ADMIN',
            'action' => 'ticket.reassigned',
            'description' => 'Mengganti teknisi tiket #42',
            'metadata' => ['old_technician_name' => 'Budi', 'technician_name' => 'Andi', 'priority' => 'TINGGI'],
        ]);
        $log->created_at = now();

        $message = AuditMessageFormatter::format($log);

        $this->assertStringContainsString('mengganti penugasan Tiket #42', $message);
        $this->assertStringContainsString('Prioritas: TINGGI', $message);
        $this->assertStringContainsString('dari Budi ke Andi', $message);
    }

    public function test_bulk_cancel_is_one_human_summary(): void
    {
        $log = new ActivityLog([
            'actor_role' => 'ADMIN',
            'action' => 'ticket.bulk_cancelled',
            'description' => 'Melakukan pembatalan massal tiket',
            'metadata' => ['ticket_ids' => [21, 24], 'reason' => 'Duplikat laporan'],
        ]);
        $log->created_at = now();

        $message = AuditMessageFormatter::format($log);

        $this->assertStringContainsString('membatalkan 2 tiket (#21, #24)', $message);
        $this->assertStringContainsString('Alasan: Duplikat laporan', $message);
    }
}
