<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Events\OrganizationTicketsChanged;
use App\Models\Building;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\Unit;
use App\Models\User;
use App\Support\PhoneNumber;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminTicketController extends Controller
{
    public function index(Request $request)
    {
        $org = TenantContext::organization($request);

        $perPage = in_array($request->integer('per_page'), [5, 10, 15, 20], true) ? $request->integer('per_page') : 5;
        $status = $request->string('status')->toString();
        $query = trim($request->string('query')->toString());
        $urgent = $request->boolean('urgent');
        $filteredQuery = $this->filteredTicketsQuery($org->id, $status, $query, $urgent);
        $tickets = (clone $filteredQuery)
            ->with(['building:id,name', 'unit:id,number', 'reporter:id,name', 'technician:id,name', 'issueCategory:id,name'])
            ->latest()->paginate($perPage)->withQueryString()->through(fn (Ticket $ticket) => [
                'id' => $ticket->id, 'status' => $ticket->status->value, 'issue_category' => $ticket->issueCategory, 'custom_issue_category' => $ticket->custom_issue_category,
                'building' => $ticket->building, 'unit' => $ticket->unit, 'reporter' => $ticket->reporter, 'reporter_name' => $ticket->reporter_name, 'reporter_phone' => $ticket->reporter_phone,
                'technician' => $ticket->technician, 'priority' => $ticket->priority?->value, 'is_urgent' => $ticket->reporter_id === null, 'submitted_at' => $ticket->created_at?->toIso8601String(),
            ]);
        $statusCounts = (clone $filteredQuery)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $urgentCount = Ticket::where('organization_id', $org->id)->whereNull('reporter_id')->count();

        return Inertia::render('Admin/Tickets', ['tickets' => $tickets, 'statusCounts' => $statusCounts, 'urgentCount' => $urgentCount, 'technicians' => Cache::remember("admin:{$org->id}:active-technicians", now()->addMinute(), fn () => User::where('organization_id', $org->id)->where('role', UserRole::Technician)->where('is_active', true)->get(['id', 'name']))]);
    }

    private function filteredTicketsQuery(int $organizationId, string $status, string $query, bool $urgent)
    {
        return Ticket::where('organization_id', $organizationId)
            ->when(in_array($status, array_column(TicketStatus::cases(), 'value'), true), fn ($builder) => $builder->where('status', $status))
            ->when($urgent, fn ($builder) => $builder->whereNull('reporter_id'))
            ->when($query !== '', fn ($builder) => $builder->where(function ($builder) use ($query) {
                $builder->where('id', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('reporter_name', 'like', "%{$query}%")
                    ->orWhere('reporter_phone', 'like', "%{$query}%")
                    ->orWhereHas('building', fn ($building) => $building->where('name', 'like', "%{$query}%"))
                    ->orWhereHas('unit', fn ($unit) => $unit->where('number', 'like', "%{$query}%"))
                    ->orWhereHas('issueCategory', fn ($category) => $category->where('name', 'like', "%{$query}%"))
                    ->orWhereHas('technician', fn ($technician) => $technician->where('name', 'like', "%{$query}%"));
            }));
    }

    public function show(Request $request, Ticket $ticket)
    {
        $org = TenantContext::organization($request);
        abort_unless($ticket->organization_id === $org->id, 404);
        $ticket->load(['building:id,name', 'unit:id,number', 'reporter:id,name,phone_number', 'technician:id,name', 'issueCategory:id,name', 'photos:id,ticket_id,type,storage_path,mime_type,created_at', 'workNotes:id,ticket_id,body,created_at', 'statusHistories:id,ticket_id,new_status,created_at']);
        $history = fn (TicketStatus $status) => $ticket->statusHistories->firstWhere('new_status', $status);

        return response()->json([
            'id' => $ticket->id, 'status' => $ticket->status->value, 'issue_category' => $ticket->issueCategory, 'custom_issue_category' => $ticket->custom_issue_category,
            'building' => $ticket->building, 'unit' => $ticket->unit, 'reporter' => $ticket->reporter, 'reporter_name' => $ticket->reporter_name, 'reporter_phone' => $ticket->reporter_phone, 'technician' => $ticket->technician,
            'description' => $ticket->description, 'priority' => $ticket->priority?->value, 'is_urgent' => $ticket->reporter_id === null,
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

    public function locations(Request $request)
    {
        $organization = TenantContext::organization($request);

        return Inertia::render('Admin/Locations', [
            'buildings' => Building::where('organization_id', $organization->id)
                ->with(['units' => fn ($query) => $query->orderBy('number')])
                ->orderBy('name')
                ->get(['id', 'name', 'is_active']),
        ]);
    }

    public function unit(Request $r)
    {
        $o = TenantContext::organization($r);
        $d = $r->validate(['building_id' => 'required|integer', 'number' => 'required|string|max:50']);
        $building = Building::where('organization_id', $o->id)->findOrFail($d['building_id']);
        abort_if(Unit::where('organization_id', $o->id)->where('building_id', $building->id)->where('number', $d['number'])->exists(), 422, 'Unit sudah ada di gedung/area ini.');
        Unit::create(['organization_id' => $o->id, ...$d]);

        return back();
    }

    public function updateBuilding(Request $r, Building $building)
    {
        $o = TenantContext::organization($r);
        abort_unless($building->organization_id === $o->id, 404);
        $building->update($r->validate(['name' => 'required|string|max:120']));
        return back();
    }

    public function toggleBuilding(Request $r, Building $building)
    {
        $o = TenantContext::organization($r);
        abort_unless($building->organization_id === $o->id, 404);
        $active = ! $building->is_active;
        $building->update(['is_active' => $active]);
        if (! $active) $building->units()->update(['is_active' => false]);
        return back();
    }

    public function updateUnit(Request $r, Unit $unit)
    {
        $o = TenantContext::organization($r);
        abort_unless($unit->organization_id === $o->id, 404);
        $d = $r->validate(['name' => 'required|string|max:50']);
        abort_if(Unit::where('organization_id', $o->id)->where('building_id', $unit->building_id)->where('number', $d['name'])->where('id', '!=', $unit->id)->exists(), 422, 'Unit sudah ada di gedung/area ini.');
        $unit->update(['number' => $d['name']]);
        return back();
    }

    public function toggleUnit(Request $r, Unit $unit)
    {
        $o = TenantContext::organization($r);
        abort_unless($unit->organization_id === $o->id, 404);
        $unit->update(['is_active' => ! $unit->is_active]);
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
        try {
            OrganizationTicketsChanged::dispatch($o->id, 'updated');
        } catch (\Throwable $exception) {
            report($exception);
        }
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
        try {
            OrganizationTicketsChanged::dispatch($o->id, 'updated');
        } catch (\Throwable $exception) {
            report($exception);
        }
        return back();
    }

    public function bulkDispatch(Request $r)
    {
        $o = TenantContext::organization($r);
        $d = $r->validate(['ticket_ids' => 'required|array|min:1', 'ticket_ids.*' => 'integer', 'technician_id' => 'required|integer', 'priority' => 'required|in:TINGGI,SEDANG,RENDAH']);
        $technician = User::where('organization_id', $o->id)->where('role', UserRole::Technician)->where('is_active', true)->findOrFail($d['technician_id']);
        $tickets = Ticket::where('organization_id', $o->id)->whereIn('id', $d['ticket_ids'])->lockForUpdate()->get();
        abort_if($tickets->count() !== count(array_unique($d['ticket_ids'])), 422, 'Sebagian tiket tidak ditemukan.');
        abort_if($tickets->contains(fn (Ticket $ticket) => $ticket->status !== TicketStatus::WaitingDispatch), 422, 'Semua tiket harus berstatus menunggu dispatch.');
        DB::transaction(function () use ($tickets, $technician, $d, $o, $r) {
            foreach ($tickets as $ticket) {
                $ticket->update(['technician_id' => $technician->id, 'priority' => $d['priority'], 'status' => TicketStatus::Assigned]);
                TicketStatusHistory::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'old_status' => TicketStatus::WaitingDispatch, 'new_status' => TicketStatus::Assigned, 'changed_by' => $r->user()->id]);
            }
        });
        $this->forgetTicketCache($o->id);
        OrganizationTicketsChanged::dispatch($o->id, 'updated');
        return back();
    }

    public function bulkCancel(Request $r)
    {
        $o = TenantContext::organization($r);
        $d = $r->validate(['ticket_ids' => 'required|array|min:1', 'ticket_ids.*' => 'integer', 'reason' => 'required|string|max:2000']);
        $tickets = Ticket::where('organization_id', $o->id)->whereIn('id', $d['ticket_ids'])->lockForUpdate()->get();
        abort_if($tickets->count() !== count(array_unique($d['ticket_ids'])), 422, 'Sebagian tiket tidak ditemukan.');
        abort_if($tickets->contains(fn (Ticket $ticket) => in_array($ticket->status, [TicketStatus::Completed, TicketStatus::Cancelled], true)), 422, 'Tiket selesai atau dibatalkan tidak dapat dibatalkan lagi.');
        DB::transaction(function () use ($tickets, $d, $o, $r) {
            foreach ($tickets as $ticket) {
                $old = $ticket->status;
                $ticket->update(['status' => TicketStatus::Cancelled, 'cancellation_reason' => $d['reason'], 'cancelled_by' => $r->user()->id, 'cancelled_at' => now()]);
                TicketStatusHistory::create(['organization_id' => $o->id, 'ticket_id' => $ticket->id, 'old_status' => $old, 'new_status' => TicketStatus::Cancelled, 'changed_by' => $r->user()->id, 'note' => $d['reason']]);
            }
        });
        $this->forgetTicketCache($o->id);
        OrganizationTicketsChanged::dispatch($o->id, 'updated');
        return back();
    }

    private function forgetTicketCache(int $organizationId): void
    {
        Cache::forget("admin:{$organizationId}:ticket-status-counts");
        Cache::forget("admin:{$organizationId}:tickets:1");
    }
}
