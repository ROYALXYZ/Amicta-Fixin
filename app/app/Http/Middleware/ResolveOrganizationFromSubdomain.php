<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class ResolveOrganizationFromSubdomain
{
    public function handle(Request $request, Closure $next): Response
    {
        $baseDomain = strtolower(trim((string) config('tenancy.base_domain'), '.'));
        $host = strtolower($request->getHost());

        if ($baseDomain === '' || ! str_ends_with($host, '.'.$baseDomain)) {
            return $next($request);
        }

        $slug = substr($host, 0, -strlen('.'.$baseDomain));

        if ($slug === '' || str_contains($slug, '.')) {
            abort(404);
        }

        $organization = Cache::remember("tenant:{$slug}", now()->addMinute(), fn () => Organization::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail());

        $request->attributes->set('organization', $organization);

        return $next($request);
    }
}
