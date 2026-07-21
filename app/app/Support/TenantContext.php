<?php

namespace App\Support;

use App\Models\Organization;
use Illuminate\Http\Request;

class TenantContext
{
    public static function organization(Request $request): Organization
    {
        $organization = $request->attributes->get('organization');

        abort_unless($organization instanceof Organization, 404);

        return $organization;
    }
}
