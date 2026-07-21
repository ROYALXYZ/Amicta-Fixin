<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Building;
use App\Models\IssueCategory;
use App\Models\Organization;
use App\Models\Ticket;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ResidentDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_resident_dashboard_shows_only_their_tenant_scoped_summary(): void
    {
        $organization = Organization::create(['name' => 'Apartemen A', 'slug' => 'apartemen-a']);
        $resident = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Resident]);
        $otherResident = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Resident]);
        $building = Building::create(['organization_id' => $organization->id, 'name' => 'Tower A']);
        $unit = Unit::create(['organization_id' => $organization->id, 'building_id' => $building->id, 'number' => '101']);
        $category = IssueCategory::create(['code' => 'LISTRIK', 'name' => 'Listrik']);

        foreach ([TicketStatus::WaitingDispatch, TicketStatus::Assigned, TicketStatus::InProgress, TicketStatus::Completed] as $status) {
            Ticket::create([
                'organization_id' => $organization->id,
                'reporter_id' => $resident->id,
                'building_id' => $building->id,
                'unit_id' => $unit->id,
                'issue_category_id' => $category->id,
                'description' => 'Lampu rusak',
                'status' => $status,
            ]);
        }

        Ticket::create([
            'organization_id' => $organization->id,
            'reporter_id' => $otherResident->id,
            'building_id' => $building->id,
            'unit_id' => $unit->id,
            'issue_category_id' => $category->id,
            'description' => 'Laporan penghuni lain',
            'status' => TicketStatus::Completed,
        ]);

        $this->actingAs($resident)
            ->withServerVariables(['HTTP_HOST' => 'apartemen-a.localhost'])
            ->get(route('resident.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Resident/Dashboard')
                ->where('summary.total', 4)
                ->where('summary.pending', 2)
                ->where('summary.inProgress', 1)
                ->where('summary.completed', 1)
                ->has('recentTickets', 4));
    }
}
