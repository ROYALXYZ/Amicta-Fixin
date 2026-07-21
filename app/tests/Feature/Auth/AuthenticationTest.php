<?php

namespace Tests\Feature\Auth;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $this->createOrganization();

        $response = $this->get('http://amikom.example.test/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_a_phone_number(): void
    {
        $organization = $this->createOrganization();
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'phone_number' => '6281234567890',
        ]);

        $response = $this->post('http://amikom.example.test/login', [
            'login' => $user->phone_number,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_authenticate_using_a_username(): void
    {
        $organization = $this->createOrganization();
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'username' => 'admin-amikom',
        ]);

        $response = $this->post('http://amikom.example.test/login', [
            'login' => $user->username,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $organization = $this->createOrganization();
        $user = User::factory()->create([
            'organization_id' => $organization->id,
        ]);

        $this->post('http://amikom.example.test/login', [
            'login' => $user->phone_number,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_not_authenticate_from_another_organization_subdomain(): void
    {
        $amikom = $this->createOrganization();
        Organization::query()->create([
            'name' => 'Astra Motor',
            'slug' => 'astra-motor',
        ]);
        $user = User::factory()->create([
            'organization_id' => $amikom->id,
            'phone_number' => '6281234567890',
        ]);

        $this->post('http://astra-motor.example.test/login', [
            'login' => $user->phone_number,
            'password' => 'password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    private function createOrganization(): Organization
    {
        return Organization::query()->create([
            'name' => 'Amikom',
            'slug' => 'amikom',
        ]);
    }
}
