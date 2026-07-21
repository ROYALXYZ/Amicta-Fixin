<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Models\Building;
use App\Models\IssueCategory;
use App\Models\Ticket;
use App\Models\TicketPhoto;
use App\Models\TicketStatusHistory;
use App\Models\Unit;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResidentTicketController extends Controller
{
    public function index(Request $request)
    {
        $org = TenantContext::organization($request);

        return Inertia::render('Resident/Tickets', ['tickets' => Ticket::where('organization_id', $org->id)->where('reporter_id', $request->user()->id)->with(['building:id,name', 'unit:id,number', 'issueCategory:id,name'])->latest()->get(), 'buildings' => Building::where('organization_id', $org->id)->where('is_active', true)->with('units')->get(), 'categories' => IssueCategory::where('is_active', true)->get(['id', 'name'])]);
    }

    public function store(Request $request)
    {
        $org = TenantContext::organization($request);
        $data = $request->validate(['building_id' => 'required|integer', 'unit_id' => 'required|integer', 'issue_category_id' => 'required|integer', 'description' => 'required|string|max:10000', 'damage_photo' => 'required|file|mimes:jpg,jpeg,webp|max:2048']);
        $building = Building::where('organization_id', $org->id)->where('is_active', true)->findOrFail($data['building_id']);
        Unit::where('organization_id', $org->id)->where('building_id', $building->id)->where('is_active', true)->findOrFail($data['unit_id']);
        IssueCategory::where('is_active', true)->findOrFail($data['issue_category_id']);
        try {
            DB::transaction(function () use ($data, $org, $request) {
                $ticket = Ticket::create(['organization_id' => $org->id, 'reporter_id' => $request->user()->id, 'building_id' => $data['building_id'], 'unit_id' => $data['unit_id'], 'issue_category_id' => $data['issue_category_id'], 'description' => $data['description'], 'status' => TicketStatus::WaitingDispatch]);
                $file = $request->file('damage_photo');
                $path = "organizations/{$org->id}/tickets/{$ticket->id}/damage.".($file->extension() ?: 'jpg');
                $file->storeAs(dirname($path), basename($path), 'supabase');
                TicketPhoto::create(['organization_id' => $org->id, 'ticket_id' => $ticket->id, 'type' => 'KERUSAKAN', 'storage_path' => $path, 'mime_type' => $file->getMimeType(), 'size_bytes' => $file->getSize(), 'uploaded_by' => $request->user()->id]);
                TicketStatusHistory::create(['organization_id' => $org->id, 'ticket_id' => $ticket->id, 'new_status' => TicketStatus::WaitingDispatch, 'changed_by' => $request->user()->id]);
            });
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors(['damage_photo' => 'Foto gagal diunggah. Pastikan JPEG/WebP maksimal 2 MB, lalu coba lagi.']);
        }

        return back();
    }
}
