<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['web', 'auth']]);

Broadcast::channel('organization.{organizationId}', function ($user, $organizationId) {
    return $user->organization_id !== null && (int) $user->organization_id === (int) $organizationId;
});
