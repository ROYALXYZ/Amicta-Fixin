<?php

namespace App\Jobs;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendReportTelegramNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(public readonly int $ticketId) {}

    public function handle(): void
    {
        $ticket = Ticket::query()->with(['organization', 'building', 'unit', 'issueCategory', 'reporter'])->find($this->ticketId);
        if (! $ticket) return;

        $reporter = $ticket->reporter?->name ?? $ticket->reporter_name ?? 'Anonim';
        $text = implode("\n", [
            "LAPORAN BARU #{$ticket->id}",
            "Organisasi: {$ticket->organization->name}",
            "Lokasi: {$ticket->building->name} / {$ticket->unit->number}",
            'Kategori: '.($ticket->custom_issue_category ?: $ticket->issueCategory?->name ?: 'Lainnya'),
            'Status: '.($ticket->status?->value ?? $ticket->status),
            "Pelapor: {$reporter}",
            'Waktu: '.$ticket->created_at->timezone(config('telegram.timezone'))->format('d M Y H:i'),
        ]);

        $chatId = config("telegram.report.chat_ids.{$ticket->organization_id}");
        if (blank($chatId)) return;

        SendTelegramMessage::dispatch('report', (string) $chatId, $text);
    }
}
