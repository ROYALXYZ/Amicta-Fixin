<?php

namespace App\Support;

use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\TicketNotification;
use Illuminate\Support\Collection;

final class TicketNotifier
{
    public static function newReport(Ticket $ticket, Organization $organization): void
    {
        $message = "Laporan baru dari ".($ticket->reporter?->name ?? $ticket->reporter_name ?? 'penghuni').'.';
        self::admins($organization)->each(fn (User $admin) => $admin->notify(new TicketNotification($ticket, 'created', $message)));
    }

    public static function assigned(Ticket $ticket, User $technician, ?User $reporter): void
    {
        $message = "Teknisi {$technician->name} ditugaskan untuk laporan ini.";
        $technician->notify(new TicketNotification($ticket, 'assigned', $message));
        $reporter?->notify(new TicketNotification($ticket, 'assigned', 'Laporan Anda sudah ditugaskan kepada teknisi.'));
    }

    public static function statusChanged(Ticket $ticket, string $message, Organization $organization): void
    {
        $ticket->reporter?->notify(new TicketNotification($ticket, 'status_changed', $message));
        self::admins($organization)->each(fn (User $admin) => $admin->notify(new TicketNotification($ticket, 'status_changed', $message)));
    }

    private static function admins(Organization $organization): Collection
    {
        return $organization->users()->where('role', 'ADMIN')->where('is_active', true)->get();
    }
}
