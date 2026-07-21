<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Building;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\Unit;
use App\Models\User;
use App\Support\PhoneNumber;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminTicketController extends Controller
{
    public function index(Request $request)
    {
        $org = TenantContext::organization($request);

        $page = $request->integer('page', 1);
        $tickets = Cache::remember("admin:{$org->id}:tickets:{$page}", now()->addSeconds(30), fn () => Ticket::where('organization_id', $org->id)
            ->with(['building:id,name', 'unit:id,number', 'reporter:id,name', 'technician:id,name', 'issueCategory:id,name'])
            ->latest()->paginate(20)->through(fn (Ticket $ticket) => [
                'id' => $ticket->id, 'status' => $ticket->status->value, 'issue_category' => $ticket->issueCategory,
                'building' => $ticket->building, 'unit' => $ticket->unit, 'reporter' => $ticket->reporter,
                'technician' => $ticket->technician, 'submitted_at' => $ticket->created_at?->toIso8601String(),
            ]));
        $statusCounts = Cache::remember("admin:{$org->id}:ticket-status-counts", now()->addMinute(), fn () => Ticket::where('organization_id', $org->id)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'));

        return Inertia::render('Admin/Tickets', ['tickets' => $tickets, 'statusCounts' => $statusCounts, 'technicians' => Cache::remember("admin:{$org->id}:active-technicians", now()->addMinute(), fn () => User::where('organization_id', $org->id)->where('role', UserRole::Technician)->where('is_active', true)->get(['id', 'name']))]);
    }

    public function show(Request $request, Ticket $ticket)
    {
        $org = TenantContext::organization($request);
        abort_unless($ticket->organization_id === $org->id, 404);
        $ticket->load(['building:id,name', 'unit:id,number', 'reporter:id,name,phone_number', 'technician:id,name', 'issueCategory:id,name', 'photos:id,ticket_id,type,storage_path,mime_type,created_at', 'workNotes:id,ticket_id,body,created_at', 'statusHistories:id,ticket_id,new_status,created_at']);
        $history = fn (TicketStatus $status) => $ticket->statusHistories->firstWhere('new_status', $status);

        return response()->json([
            'id' => $ticket->id, 'status' => $ticket->status->value, 'issue_category' => $ticket->issueCategory,
            'building' => $ticket->building, 'unit' => $ticket->unit, 'reporter' => $ticket->reporter, 'technician' => $ticket->technician,
            'description' => $ticket->description, 'priority' => $ticket->priority?->value,
            'submitted_at' => $ticket->created_at?->toIso8601String(), 'assigned_at' => $history(TicketStatus::Assigned)?->created_at?->toIso8601String(),
            'started_at' => $history(TicketStatus::InProgress)?->created_at?->toIso8601String(), 'completed_at' => $history(TicketStatus::Completed)?->created_at?->toIso8601String(),
            'photo_urls' => $ticket->photos->map(fn ($photo) => ['type' => $photo->type->value, 'mime_type' => $photo->mime_type, 'created_at' => $photo->created_at?->toIso8601String(), 'url' => Storage::disk('supabase')->temporaryUrl($photo->storage_path, now()->addMinutes(10))]),
            'work_notes' => $ticket->workNotes->map(fn ($note) => ['body' => $note->body, 'created_at' => $note->created_at?->toIso8601String()]),
        ]);
    }

    public function building(Request $r)
    {
        $o = TenantContext::organization($r);
        $d = $r->validate(['name' => 'required|string|max:120']);
        Building::create(['organization_id' => $o->id, ...$d]);

        return back();
    }

    public function unit(Request $r)
    {
        $o = TenantContext::organization($r);
        $d = $r->validate(['building_id' => 'required|integer', 'number' => 'required|string|max:50']);
        Building::where('organization_id', $o->id)->findOrFail($d['building_id']);
        Unit::create(['organization_id' => $o->id, ...$d]);

        return back();
    }

    public function technician(Request $r)
    {
        $o = TenantContext::organization($r);
        $p = PhoneNumber::normalize((string) $r->input('phone_number'));
        $r->merge(['phone_number' => $p]);
        $d = $r->validate(['name' => 'required|string|max:120', 'username' => ['required', 'alpha_dash', 'max:50', 'regex:/.*[A-Za-z_-].*/', 'unique:users,username'], 'phone_number' => 'required|unique:users,phone_number', 'password' => 'required|min:8'], ['username.regex' => 'Username tidak boleh hanya berisi angka. Gunakan minimal satu huruf, tanda hubung, atau garis bawah.']);
        User::create(['organization_id' => $o->id, 'name' => $d['name'], 'username' => $d['username'], 'phone_number' => $p, 'email' => $p.'@local.invalid', 'password' => Hash::make($d['password']), 'role' => UserRole::Technician]);

        return back();
    }

    public function dispatch(Request $r, Ticket $ticket)
    {
        $o = TenantContext::organization($r);
        abort_unless($ticket->organization_id === $o->id && $ticket->status === TicketStatus::WaitingDispatch, 403);
        $d = $r->validate(['technician_id' => 'required|integer', 'priority' => 'required|in:TINGGI,SEDANG,RENDAH']);
        $u = User::where('organization_id', $o->id)->where('role', UserRole::Technician)->findOrFail($d['technician_id']);
        $ticket->update(['technician_id' => $u->id, 'priority' => $d['priority'], 'status' => TicketStatus::Assigned]);
        TicketStatusHistory::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'old_status' => TicketStatus::WaitingDispatch, 'new_status' => TicketStatus::Assigned, 'changed_by' => $r->user()->id]);

        $this->forgetTicketCache($o->id);
        return back();
    }

    public function cancel(Request $r, Ticket $ticket)
    {
        $o = TenantContext::organization($r);
        abort_unless($ticket->organization_id === $o->id && ! in_array($ticket->status, [TicketStatus::Completed, TicketStatus::Cancelled], true), 403);
        $d = $r->validate(['reason' => 'required|string|max:2000']);
        $old = $ticket->status;
        $ticket->update(['status' => TicketStatus::Cancelled, 'cancellation_reason' => $d['reason'], 'cancelled_by' => $r->user()->id, 'cancelled_at' => now()]);
        TicketStatusHistory::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'old_status' => $old, 'new_status' => TicketStatus::Cancelled, 'changed_by' => $r->user()->id, 'note' => $d['reason']]);

        $this->forgetTicketCache($o->id);
        return back();
    }

    private function forgetTicketCache(int $organizationId): void
    {
        Cache::forget("admin:{$organizationId}:ticket-status-counts");
        Cache::forget("admin:{$organizationId}:tickets:1");
    }
}
