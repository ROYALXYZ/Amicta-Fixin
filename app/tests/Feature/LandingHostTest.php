<?php

namespace Tests\Feature;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingHostTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_domain_renders_owner_landing_mode(): void
    {
        $response = $this->get('http://example.test/');

        $response->assertSuccessful();
    }

    public function test_active_tenant_subdomain_renders_tenant_landing_mode(): void
    {
        Organization::create(['name' => 'UPN', 'slug' => 'upn', 'is_active' => true]);

        $response = $this->get('http://upn.example.test/');

        $response->assertSuccessful();
    }

    public function test_unknown_or_inactive_tenant_subdomain_returns_not_found(): void
    {
        $this->get('http://unknown.example.test/')->assertNotFound();

        Organization::create(['name' => 'Inactive', 'slug' => 'inactive', 'is_active' => false]);

        $this->get('http://inactive.example.test/')->assertNotFound();
    }
}
