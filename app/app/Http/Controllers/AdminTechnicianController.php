<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Events\OrganizationTechniciansChanged;
use App\Models\User;
use App\Support\PhoneNumber;
use App\Support\TenantContext;
use App\Support\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminTechnicianController extends Controller
{
    public function index(Request $request)
    {
        $organization = TenantContext::organization($request);

        return Inertia::render('Admin/Technicians', [
            'technicians' => Cache::remember("admin:{$organization->id}:technicians", now()->addMinute(), fn () => User::where('organization_id', $organization->id)
                ->where('role', UserRole::Technician)
                ->withCount('assignedTickets')
                ->orderBy('name')
                ->get(['id', 'name', 'username', 'phone_number', 'is_active', 'created_at'])),
        ]);
    }

    public function store(Request $request)
    {
        $organization = TenantContext::organization($request);
        $data = $this->validated($request);

        $technician = User::create([
            'organization_id' => $organization->id,
            ...$data,
            'phone_number' => PhoneNumber::normalize($data['phone_number']),
            'email' => PhoneNumber::normalize($data['phone_number']).'@local.invalid',
            'password' => Hash::make($data['password']),
            'role' => UserRole::Technician,
        ]);
        AuditLogger::record('technician.created', "Membuat teknisi {$technician->name}", $organization, $request->user(), $technician);

        $this->forgetTechnicianCache($organization->id);
        OrganizationTechniciansChanged::dispatch($organization->id, 'created');
        return back();
    }

    public function update(Request $request, User $technician)
    {
        $this->technician($request, $technician);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'alpha_dash', 'max:50', 'regex:/.*[A-Za-z_-].*/', Rule::unique('users', 'username')->ignore($technician->id)],
            'password' => ['nullable', 'string', 'min:8'],
        ], ['username.regex' => 'Username tidak boleh hanya berisi angka. Gunakan minimal satu huruf, tanda hubung, atau garis bawah.']);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }
        $technician->update($data);
        AuditLogger::record('technician.updated', "Mengubah teknisi {$technician->name}", TenantContext::organization($request), $request->user(), $technician);

        $this->forgetTechnicianCache($technician->organization_id);
        OrganizationTechniciansChanged::dispatch($technician->organization_id, 'updated');
        return back();
    }

    public function toggle(Request $request, User $technician)
    {
        $this->technician($request, $technician);
        $technician->update(['is_active' => ! $technician->is_active]);
        AuditLogger::record('technician.'.($technician->is_active ? 'activated' : 'deactivated'), "Mengubah status teknisi {$technician->name}", TenantContext::organization($request), $request->user(), $technician, ['is_active' => $technician->is_active]);
        $this->forgetTechnicianCache($technician->organization_id);
        OrganizationTechniciansChanged::dispatch($technician->organization_id, 'updated');

        if ($request->expectsJson()) {
            return response()->json(['is_active' => $technician->is_active]);
        }

        return back();
    }

    public function destroy(Request $request, User $technician)
    {
        $this->technician($request, $technician);
        abort_if($technician->assignedTickets()->exists(), 422, 'Teknisi memiliki riwayat tiket. Nonaktifkan akun sebagai gantinya agar riwayat tetap utuh.');
        $technician->delete();

        $this->forgetTechnicianCache($technician->organization_id);
        OrganizationTechniciansChanged::dispatch($technician->organization_id, 'deleted');
        return back();
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'alpha_dash', 'max:50', 'regex:/.*[A-Za-z_-].*/', 'unique:users,username'],
            'phone_number' => ['required', 'string', 'max:30', 'unique:users,phone_number'],
            'password' => ['required', 'string', 'min:8'],
        ], ['username.regex' => 'Username tidak boleh hanya berisi angka. Gunakan minimal satu huruf, tanda hubung, atau garis bawah.']);
    }

    private function technician(Request $request, User $technician): void
    {
        $organization = TenantContext::organization($request);
        abort_unless($technician->organization_id === $organization->id && $technician->role === UserRole::Technician, 404);
    }

    private function forgetTechnicianCache(int $organizationId): void
    {
        Cache::forget("admin:{$organizationId}:technicians");
        Cache::forget("admin:{$organizationId}:active-technicians");
    }
}
