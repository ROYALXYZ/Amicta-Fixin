<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserBelongsToOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        $organization = $request->attributes->get('organization');
        $user = $request->user();

        if ($organization === null || $user === null) {
            return $next($request);
        }

        if ($user->organization_id !== $organization->id || ! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            abort(403);
        }

        return $next($request);
    }
}
