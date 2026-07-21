<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketPhoto;
use App\Models\TicketStatusHistory;
use App\Models\TicketWorkNote;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TechnicianTicketController extends Controller
{
    public function index(Request $r)
    {
        $o = TenantContext::organization($r);

        $tickets = Ticket::where('organization_id', $o->id)->where('technician_id', $r->user()->id)->with(['building:id,name', 'unit:id,number', 'issueCategory:id,name', 'photos:id,ticket_id,type,storage_path,mime_type,created_at', 'workNotes:id,ticket_id,technician_id,body,created_at', 'statusHistories:id,ticket_id,new_status,created_at'])->latest()->get();
        $tickets->each(function (Ticket $ticket): void {
            $history = fn (TicketStatus $status) => $ticket->statusHistories->firstWhere('new_status', $status);
            $ticket->setAttribute('submitted_at', $ticket->created_at?->toIso8601String());
            $ticket->setAttribute('assigned_at', $history(TicketStatus::Assigned)?->created_at?->toIso8601String());
            $ticket->setAttribute('started_at', $history(TicketStatus::InProgress)?->created_at?->toIso8601String());
            $ticket->setAttribute('completed_at', $history(TicketStatus::Completed)?->created_at?->toIso8601String());
            $ticket->setAttribute('photo_urls', $ticket->photos->map(fn ($photo) => [
                'type' => $photo->type->value,
                'created_at' => $photo->created_at?->toIso8601String(),
                'url' => Storage::disk('supabase')->temporaryUrl($photo->storage_path, now()->addMinutes(10)),
            ])->values());
            $ticket->setAttribute('work_notes', $ticket->workNotes->map(fn ($note) => [
                'body' => $note->body,
                'created_at' => $note->created_at?->toIso8601String(),
            ])->values()->all());
        });

        return Inertia::render('Technician/Tickets', ['tickets' => $tickets]);
    }

    public function start(Request $r, Ticket $ticket)
    {
        $o = TenantContext::organization($r);
        abort_unless($ticket->organization_id === $o->id && $ticket->technician_id === $r->user()->id && $ticket->status === TicketStatus::Assigned, 403);
        $ticket->update(['status' => TicketStatus::InProgress]);
        TicketStatusHistory::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'old_status' => TicketStatus::Assigned, 'new_status' => TicketStatus::InProgress, 'changed_by' => $r->user()->id]);

        return back();
    }

    public function note(Request $r, Ticket $ticket)
    {
        $o = TenantContext::organization($r);
        abort_unless($ticket->organization_id === $o->id && $ticket->technician_id === $r->user()->id && $ticket->status === TicketStatus::InProgress, 403);
        $d = $r->validate(['body' => 'required|string|max:2000']);
        TicketWorkNote::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'technician_id' => $r->user()->id, 'body' => $d['body']]);

        return back();
    }

    public function complete(Request $r, Ticket $ticket)
    {
        $o = TenantContext::organization($r);
        abort_unless($ticket->organization_id === $o->id && $ticket->technician_id === $r->user()->id && $ticket->status === TicketStatus::InProgress, 403);
        $d = $r->validate([
            'completion_photo' => 'required|file|mimes:jpg,jpeg,webp|max:2048',
            'work_note' => 'nullable|string|max:2000',
        ], [
            'completion_photo.required' => 'Pilih foto bukti penyelesaian terlebih dahulu.',
            'completion_photo.file' => 'Berkas foto tidak dapat dibaca. Pilih ulang foto dari perangkat Anda.',
            'completion_photo.mimes' => 'Berkas ini tidak terdeteksi sebagai JPEG atau WebP, meskipun ekstensi namanya mungkin .jpg/.jpeg. Ekspor atau pilih foto lain.',
            'completion_photo.max' => 'Ukuran foto melebihi 2 MB. Kompres atau pilih foto yang lebih kecil.',
        ]);
        if (filled($d['work_note'] ?? null)) {
            TicketWorkNote::create([
                'organization_id' => $o->id,
                'ticket_id' => $ticket->id,
                'technician_id' => $r->user()->id,
                'body' => $d['work_note'],
            ]);
        }
        $f = $r->file('completion_photo');
        $p = "organizations/{$o->id}/tickets/{$ticket->id}/completion.".($f->extension() ?: 'jpg');
        $f->storeAs(dirname($p), basename($p), 'supabase');
        TicketPhoto::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'type' => 'PENYELESAIAN', 'storage_path' => $p, 'mime_type' => $f->getMimeType(), 'size_bytes' => $f->getSize(), 'uploaded_by' => $r->user()->id]);
        $ticket->update(['status' => TicketStatus::Completed]);
        TicketStatusHistory::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'old_status' => TicketStatus::InProgress, 'new_status' => TicketStatus::Completed, 'changed_by' => $r->user()->id]);

        return back();
    }
}
