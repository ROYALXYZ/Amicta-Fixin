<?php

namespace Tests\Feature\Auth;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $this->createOrganization();

        $response = $this->get('http://amikom.example.test/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $organization = $this->createOrganization();

        $response = $this->post('http://amikom.example.test/register', [
            'name' => 'Test User',
            'username' => 'test-user',
            'phone_number' => '081234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'organization_id' => $organization->id,
            'phone_number' => '6281234567890',
        ]);
    }

    private function createOrganization(): Organization
    {
        return Organization::query()->create([
            'name' => 'Amikom',
            'slug' => 'amikom',
        ]);
    }
}
