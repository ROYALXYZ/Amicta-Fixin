<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;

final class AuditMessageFormatter
{
    public static function format(ActivityLog $log, bool $compact = false): string
    {
        $actor = $log->actor?->name ?? match ($log->actor_role) {
            'RESIDENT' => 'Penghuni',
            'TECHNICIAN' => 'Teknisi',
            'ADMIN' => 'Admin',
            default => 'Sistem',
        };
        $time = $log->created_at?->timezone(config('telegram.timezone'))->format($compact ? 'd M H:i' : 'd M Y H:i:s');
        $sentence = self::sentence($log->action, $log->description, $actor, $log->metadata ?? []);

        return $compact ? "[{$time}] {$sentence}" : "AUDIT AKTIVITAS\n🕒 {$time} WIB\n{$sentence}";
    }

    private static function sentence(string $action, string $description, string $actor, array $metadata): string
    {
        $ticket = self::ticketNumber($description, $metadata);
        $subject = $ticket ? "Tiket #{$ticket}" : 'Data FixIn';

        $newTicket = $ticket ? " {$subject}" : '';

        return match ($action) {
            'ticket.created' => "📝 {$actor} membuat laporan baru{$newTicket}.",
            'ticket.assigned' => "👤 {$actor} menugaskan {$subject} kepada teknisi.".self::priority($metadata),
            'ticket.reassigned' => self::reassignment($actor, $subject, $metadata),
            'ticket.bulk_assigned' => self::bulkAssigned($actor, $metadata),
            'ticket.bulk_cancelled' => self::bulkCancelled($actor, $metadata),
            'ticket.started' => "🔧 {$actor} mulai mengerjakan {$subject}.",
            'ticket.note_added' => "💬 {$actor} menambahkan catatan pada {$subject}.",
            'ticket.completed' => "✅ {$actor} menyelesaikan {$subject}.",
            'ticket.cancelled' => "🚫 {$actor} membatalkan {$subject}.".self::reason($metadata),
            'technician.created' => "👷 {$actor} menambahkan akun teknisi baru.",
            'technician.updated' => "👷 {$actor} memperbarui data teknisi.",
            'technician.deactivated' => "⏸️ {$actor} menonaktifkan akun teknisi.",
            'technician.activated' => "▶️ {$actor} mengaktifkan akun teknisi.",
            'building.created' => "🏢 {$actor} menambahkan gedung baru.",
            'building.updated' => "🏢 {$actor} memperbarui data gedung.",
            'building.deactivated' => "⏸️ {$actor} menonaktifkan gedung.",
            'building.activated' => "▶️ {$actor} mengaktifkan gedung beserta {$metadata['unit_count']} unit.",
            'unit.created' => "🚪 {$actor} menambahkan unit baru.",
            'unit.updated' => "🚪 {$actor} memperbarui data unit.",
            'unit.deactivated' => "⏸️ {$actor} menonaktifkan unit.",
            default => "ℹ️ {$actor}: {$description}.",
        };
    }

    private static function ticketNumber(string $description, array $metadata): ?string
    {
        if (preg_match('/#(\d+)/', $description, $matches)) return $matches[1];
        return isset($metadata['ticket_id']) ? (string) $metadata['ticket_id'] : null;
    }

    private static function priority(array $metadata): string
    {
        return filled($metadata['priority'] ?? null) ? " Prioritas: {$metadata['priority']}." : '';
    }

    private static function reason(array $metadata): string
    {
        return filled($metadata['reason'] ?? null) ? " Alasan: {$metadata['reason']}." : '';
    }

    private static function reassignment(string $actor, string $subject, array $metadata): string
    {
        $oldName = $metadata['old_technician_name'] ?? self::userName($metadata['old_technician_id'] ?? null, 'teknisi sebelumnya');
        $newName = $metadata['technician_name'] ?? self::userName($metadata['technician_id'] ?? null, 'teknisi baru');

        return "🔁 {$actor} mengganti penugasan {$subject} dari {$oldName} ke {$newName}.".self::priority($metadata);
    }

    private static function userName(mixed $userId, string $fallback): string
    {
        return filled($userId) ? (User::query()->whereKey($userId)->value('name') ?? $fallback) : $fallback;
    }

    private static function bulkAssigned(string $actor, array $metadata): string
    {
        $tickets = implode(', #', $metadata['ticket_ids'] ?? []);
        $technician = self::userName($metadata['technician_id'] ?? null, 'teknisi');
        return "📋 {$actor} menugaskan ".count($metadata['ticket_ids'] ?? [])." tiket (#{$tickets}) kepada {$technician}.".self::priority($metadata);
    }

    private static function bulkCancelled(string $actor, array $metadata): string
    {
        $tickets = implode(', #', $metadata['ticket_ids'] ?? []);
        return "🚫 {$actor} membatalkan ".count($metadata['ticket_ids'] ?? [])." tiket (#{$tickets}).".self::reason($metadata);
    }
}
