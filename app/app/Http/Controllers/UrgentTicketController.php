<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Building;
use App\Models\IssueCategory;
use App\Models\Ticket;
use App\Models\TicketPhoto;
use App\Models\TicketStatusHistory;
use App\Models\Unit;
use App\Jobs\SendReportTelegramNotification;
use App\Support\AuditLogger;
use App\Support\TicketNotifier;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UrgentTicketController extends Controller
{
    public function create(Request $request)
    {
        $organization = TenantContext::organization($request);

        return Inertia::render('Urgent/Create', [
            'organization' => $organization->only('name', 'slug'),
            'buildings' => Building::where('organization_id', $organization->id)->where('is_active', true)->with(['units' => fn ($query) => $query->where('is_active', true)])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $organization = TenantContext::organization($request);
        $data = $request->validate([
            'reporter_name' => 'required|string|max:120',
            'reporter_phone' => 'required|string|max:30',
            'building_id' => 'required|integer',
            'unit_id' => 'required|integer',
            'issue_category_name' => 'required|string|max:120',
            'description' => 'required|string|max:10000',
            'damage_photo' => 'nullable|file|mimes:jpg,jpeg,webp|max:2048',
        ]);
        $building = Building::where('organization_id', $organization->id)->where('is_active', true)->findOrFail($data['building_id']);
        Unit::where('organization_id', $organization->id)->where('building_id', $building->id)->where('is_active', true)->findOrFail($data['unit_id']);
        $category = IssueCategory::firstOrCreate(['code' => 'LAINNYA'], ['name' => 'Lainnya', 'is_active' => true]);

        $ticket = DB::transaction(function () use ($data, $organization, $category, $request) {
            $ticket = Ticket::create([
                'organization_id' => $organization->id,
                'reporter_name' => $data['reporter_name'],
                'reporter_phone' => $data['reporter_phone'],
                'building_id' => $data['building_id'],
                'unit_id' => $data['unit_id'],
                'issue_category_id' => $category->id,
                'custom_issue_category' => $data['issue_category_name'],
                'description' => $data['description'],
                'priority' => TicketPriority::High,
                'status' => TicketStatus::WaitingDispatch,
            ]);

            if ($request->hasFile('damage_photo')) {
                $file = $request->file('damage_photo');
                $path = "organizations/{$organization->id}/tickets/{$ticket->id}/damage.".($file->extension() ?: 'jpg');
                $file->storeAs(dirname($path), basename($path), 'supabase');
                TicketPhoto::create(['organization_id' => $organization->id, 'ticket_id' => $ticket->id, 'type' => 'KERUSAKAN', 'storage_path' => $path, 'mime_type' => $file->getMimeType(), 'size_bytes' => $file->getSize(), 'uploaded_by' => null]);
            }

            TicketStatusHistory::create(['organization_id' => $organization->id, 'ticket_id' => $ticket->id, 'new_status' => TicketStatus::WaitingDispatch, 'changed_by' => null, 'note' => 'Laporan urgent anonim.']);

            return $ticket;
        });

        AuditLogger::record('ticket.created', "Membuat laporan urgent #{$ticket->id}", $organization, null, $ticket, ['anonymous' => true, 'status' => $ticket->status?->value]);
        TicketNotifier::newReport($ticket, $organization);
        SendReportTelegramNotification::dispatch($ticket->id)->afterCommit();

        return to_route('urgent.create')->with('success', "Laporan urgent #{$ticket->id} berhasil dikirim.");
    }
}
