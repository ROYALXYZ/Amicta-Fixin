<?php

namespace App\Http\Controllers;

use App\Actions\ProvisionOrganization;
use App\Models\Organization;
use App\Support\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlatformOrganizationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Platform/Organizations', [
            'organizations' => Organization::query()
                ->withCount('users')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'is_active', 'created_at']),
        ]);
    }

    public function store(Request $request, ProvisionOrganization $provisionOrganization): RedirectResponse
    {
        $phoneNumber = PhoneNumber::normalize((string) $request->input('admin_phone_number'));
        $request->merge([
            'slug' => Str::slug((string) $request->input('slug')),
            'admin_phone_number' => $phoneNumber,
        ]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:63', 'regex:/^[a-z0-9-]+$/', Rule::unique('organizations')],
            'admin_name' => ['required', 'string', 'max:120'],
            'admin_username' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('users', 'username')],
            'admin_phone_number' => ['required', 'string', Rule::unique('users', 'phone_number')],
            'admin_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $provisionOrganization->handle($data);

        return to_route('platform.organizations.index')
            ->with('success', 'Organisasi dan Admin pertama berhasil dibuat.');
    }
}
