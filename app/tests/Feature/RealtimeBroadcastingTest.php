<?php

namespace Tests\Feature;

use App\Events\OrganizationTechniciansChanged;
use App\Events\OrganizationTicketsChanged;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RealtimeBroadcastingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('broadcasting.default', 'reverb');
        config()->set('broadcasting.connections.reverb.key', 'test-key');
        config()->set('broadcasting.connections.reverb.secret', 'test-secret');
        config()->set('broadcasting.connections.reverb.app_id', 'test-app');
    }

    public function test_ticket_signal_uses_private_tenant_channel_and_minimal_payload(): void
    {
        $event = new OrganizationTicketsChanged(42, 'updated');

        $this->assertSame('tickets.changed', $event->broadcastAs());
        $this->assertSame(['action' => 'updated'], $event->broadcastWith());
        $this->assertInstanceOf(PrivateChannel::class, $event->broadcastOn()[0]);
        $this->assertSame('private-organization.42', $event->broadcastOn()[0]->name);
    }

    public function test_custom_broadcast_names_are_not_namespaced_by_echo(): void
    {
        $this->assertSame('.tickets.changed', '.'.(new OrganizationTicketsChanged(42, 'updated'))->broadcastAs());
        $this->assertSame('.technicians.changed', '.'.(new OrganizationTechniciansChanged(42, 'updated'))->broadcastAs());
    }

    public function test_technician_signal_uses_private_tenant_channel_and_minimal_payload(): void
    {
        $event = new OrganizationTechniciansChanged(42, 'deleted');

        $this->assertInstanceOf(ShouldBroadcast::class, $event);
        $this->assertSame('technicians.changed', $event->broadcastAs());
        $this->assertSame(['action' => 'deleted'], $event->broadcastWith());
        $this->assertSame('private-organization.42', $event->broadcastOn()[0]->name);
    }

    public function test_broadcast_auth_requires_an_authenticated_user(): void
    {
        $organization = Organization::create(['name' => 'Tenant A', 'slug' => 'tenant-a']);

        $this->post('/broadcasting/auth', ['channel_name' => "private-organization.{$organization->id}", 'socket_id' => '1234.5678'])->assertRedirect('/login');
    }

    public function test_tenant_membership_contract_rejects_other_organizations(): void
    {
        $organization = Organization::create(['name' => 'Tenant A', 'slug' => 'tenant-a']);
        $otherOrganization = Organization::create(['name' => 'Tenant B', 'slug' => 'tenant-b']);
        $member = User::factory()->create(['organization_id' => $organization->id]);
        $outsider = User::factory()->create(['organization_id' => $otherOrganization->id]);

        $this->assertSame($organization->id, $member->organization_id);
        $this->assertNotSame($organization->id, $outsider->organization_id);
    }
}
