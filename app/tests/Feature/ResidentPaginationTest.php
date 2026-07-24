<?php

namespace Tests\Feature;

use App\Http\Controllers\ResidentTicketController;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tests\TestCase;

class ResidentPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_resident_ticket_pages_accept_all_visible_page_sizes(): void
    {
        $organization = Organization::create(['name' => 'Amikom', 'slug' => 'amikom']);
        $resident = User::factory()->create(['organization_id' => $organization->id]);

        foreach ([5, 10, 15, 20] as $perPage) {
            $request = Request::create("/resident/tickets?per_page={$perPage}", 'GET', [], [], [], [
                'HTTP_X_INERTIA' => 'true',
                'HTTP_X_INERTIA_VERSION' => Inertia::getVersion(),
            ]);
            $request->setUserResolver(fn () => $resident);
            $request->attributes->set('organization', $organization);

            $response = app(ResidentTicketController::class)->index($request)->toResponse($request);

            $this->assertSame($perPage, $response->getData(true)['props']['tickets']['per_page']);
        }
    }
}
