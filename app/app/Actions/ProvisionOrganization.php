<?php

namespace App\Actions;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProvisionOrganization
{
    /**
     * @param  array{name: string, slug: string, admin_name: string, admin_username: string, admin_phone_number: string, admin_password: string}  $data
     */
    public function handle(array $data): Organization
    {
        return DB::transaction(function () use ($data): Organization {
            $organization = Organization::query()->create([
                'name' => $data['name'],
                'slug' => $data['slug'],
            ]);

            User::query()->create([
                'organization_id' => $organization->id,
                'name' => $data['admin_name'],
                'username' => $data['admin_username'],
                'phone_number' => $data['admin_phone_number'],
                'email' => $data['admin_phone_number'].'@local.invalid',
                'password' => Hash::make($data['admin_password']),
                'role' => UserRole::Admin,
            ]);

            return $organization;
        });
    }
}
