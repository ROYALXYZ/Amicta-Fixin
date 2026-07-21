<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Building;
use App\Models\Organization;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoTenantSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['username' => 'platform-owner'],
            [
                'organization_id' => null,
                'name' => 'Platform Owner',
                'phone_number' => '628111111111',
                'email' => '628111111111@local.invalid',
                'password' => Hash::make('password'),
                'role' => UserRole::PlatformOwner,
                'is_active' => true,
            ],
        );

        foreach ([
            ['Amikom', 'amikom', 'Admin Amikom', 'admin-amikom', '628111000001', 'Teknisi Amikom', 'teknisi-amikom', '628111000002', 'Gedung Utama', 'A-101'],
            ['Astra Motor', 'astra-motor', 'Admin Astra', 'admin-astra', '628112000001', 'Teknisi Astra', 'teknisi-astra', '628112000002', 'Gedung Operasional', 'O-101'],
        ] as [$name, $slug, $adminName, $adminUsername, $adminPhone, $technicianName, $technicianUsername, $technicianPhone, $buildingName, $unitNumber]) {
            $organization = Organization::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'is_active' => true],
            );

            User::query()->updateOrCreate(
                ['username' => $adminUsername],
                [
                    'organization_id' => $organization->id,
                    'name' => $adminName,
                    'phone_number' => $adminPhone,
                    'email' => $adminPhone.'@local.invalid',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Admin,
                    'is_active' => true,
                ],
            );

            User::query()->updateOrCreate(
                ['username' => $technicianUsername],
                [
                    'organization_id' => $organization->id,
                    'name' => $technicianName,
                    'phone_number' => $technicianPhone,
                    'email' => $technicianPhone.'@local.invalid',
                    'password' => Hash::make('password'),
                    'role' => UserRole::Technician,
                    'is_active' => true,
                ],
            );

            $building = Building::query()->updateOrCreate(
                ['organization_id' => $organization->id, 'name' => $buildingName],
                ['is_active' => true],
            );

            Unit::query()->updateOrCreate(
                ['building_id' => $building->id, 'number' => $unitNumber],
                ['organization_id' => $organization->id, 'is_active' => true],
            );
        }
    }
}
