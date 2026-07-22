<?php

namespace App\Http\Controllers;

use App\Enums\TicketStatus;
use App\Events\OrganizationTicketsChanged;
use App\Models\Building;
use App\Models\IssueCategory;
use App\Models\Ticket;
use App\Models\TicketPhoto;
use App\Models\TicketStatusHistory;
use App\Models\Unit;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ResidentTicketController extends Controller
{
    public function dashboard(Request $request)
    {
        $org = TenantContext::organization($request);
        $perPage = in_array($request->integer('per_page'), [5, 10, 25], true) ? $request->integer('per_page') : 5;
        $tickets = Ticket::query()
            ->where('organization_id', $org->id)
            ->where('reporter_id', $request->user()->id);

        return Inertia::render('Resident/Dashboard', [
            'summary' => [
                'total' => (clone $tickets)->count(),
                'pending' => (clone $tickets)->whereIn('status', [TicketStatus::WaitingDispatch->value, TicketStatus::Assigned->value])->count(),
                'inProgress' => (clone $tickets)->where('status', TicketStatus::InProgress->value)->count(),
                'completed' => (clone $tickets)->where('status', TicketStatus::Completed->value)->count(),
            ],
            'recentTickets' => $tickets->with([
                'building:id,name',
                'unit:id,number',
                'issueCategory:id,name',
                'statusHistories' => fn ($query) => $query->with('changedBy:id,name')->oldest(),
            ])->latest()->paginate($perPage)->withQueryString(),
        ]);
    }

    public function index(Request $request)
    {
        $org = TenantContext::organization($request);
        $perPage = in_array($request->integer('per_page'), [5, 10, 25], true) ? $request->integer('per_page') : 5;

        return Inertia::render('Resident/Tickets', ['tickets' => Ticket::where('organization_id', $org->id)->where('reporter_id', $request->user()->id)->with(['building:id,name', 'unit:id,number', 'issueCategory:id,name'])->latest()->paginate($perPage)->withQueryString(), 'buildings' => Building::where('organization_id', $org->id)->where('is_active', true)->with('units')->get()]);
    }

    public function store(Request $request)
    {
        $org = TenantContext::organization($request);
        $data = $request->validate([
            'building_id' => 'required|integer',
            'unit_id' => 'required|integer',
            'issue_category_name' => 'required|string|max:120',
            'description' => 'required|string|max:10000',
            'damage_photo' => 'required|file|mimes:jpg,jpeg,webp|max:2048',
        ], [
            'damage_photo.required' => 'Pilih foto kerusakan terlebih dahulu.',
            'damage_photo.file' => 'Berkas foto tidak dapat dibaca. Pilih ulang foto dari perangkat Anda.',
            'damage_photo.mimes' => 'Berkas ini tidak terdeteksi sebagai JPEG atau WebP, meskipun ekstensi namanya mungkin .jpg/.jpeg. Ekspor atau pilih foto lain.',
            'damage_photo.max' => 'Ukuran foto melebihi 2 MB. Kompres atau pilih foto yang lebih kecil.',
        ]);
        $building = Building::where('organization_id', $org->id)->where('is_active', true)->findOrFail($data['building_id']);
        Unit::where('organization_id', $org->id)->where('building_id', $building->id)->where('is_active', true)->findOrFail($data['unit_id']);
        $category = IssueCategory::firstOrCreate(['code' => 'LAINNYA'], ['name' => 'Lainnya', 'is_active' => true]);
        try {
            DB::transaction(function () use ($data, $org, $request, $category) {
                $ticket = Ticket::create(['organization_id' => $org->id, 'reporter_id' => $request->user()->id, 'building_id' => $data['building_id'], 'unit_id' => $data['unit_id'], 'issue_category_id' => $category->id, 'custom_issue_category' => $data['issue_category_name'], 'description' => $data['description'], 'status' => TicketStatus::WaitingDispatch]);
                $file = $request->file('damage_photo');
                $path = "organizations/{$org->id}/tickets/{$ticket->id}/damage.".($file->extension() ?: 'jpg');
                $file->storeAs(dirname($path), basename($path), 'supabase');
                TicketPhoto::create(['organization_id' => $org->id, 'ticket_id' => $ticket->id, 'type' => 'KERUSAKAN', 'storage_path' => $path, 'mime_type' => $file->getMimeType(), 'size_bytes' => $file->getSize(), 'uploaded_by' => $request->user()->id]);
                TicketStatusHistory::create(['organization_id' => $org->id, 'ticket_id' => $ticket->id, 'new_status' => TicketStatus::WaitingDispatch, 'changed_by' => $request->user()->id]);
            });
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors(['damage_photo' => 'Foto sudah valid, tetapi penyimpanan gagal. Coba lagi beberapa saat.']);
        }

        Cache::forget("admin:{$org->id}:tickets:1");
        Cache::forget("admin:{$org->id}:ticket-status-counts");
        try {
            OrganizationTicketsChanged::dispatch($org->id, 'created');
        } catch (\Throwable $exception) {
            report($exception);
        }

        return back();
    }
}
