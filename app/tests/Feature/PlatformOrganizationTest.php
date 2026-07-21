<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformOrganizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_owner_can_provision_an_organization_and_its_first_admin(): void
    {
        $owner = User::factory()->create([
            'organization_id' => null,
            'role' => UserRole::PlatformOwner,
        ]);

        $response = $this->actingAs($owner)->post('/platform/organizations', [
            'name' => 'UPN Veteran Jawa Timur',
            'slug' => 'upn',
            'admin_name' => 'Admin UPN',
            'admin_username' => 'admin-upn',
            'admin_phone_number' => '081234567890',
            'admin_password' => 'password123',
            'admin_password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('platform.organizations.index', absolute: false));
        $this->assertDatabaseHas('organizations', ['slug' => 'upn']);
        $this->assertDatabaseHas('users', [
            'username' => 'admin-upn',
            'phone_number' => '6281234567890',
            'role' => UserRole::Admin->value,
        ]);
    }

    public function test_non_owner_cannot_provision_an_organization(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Resident,
        ]);

        $this->actingAs($user)
            ->post('/platform/organizations', [])
            ->assertForbidden();
    }
}
