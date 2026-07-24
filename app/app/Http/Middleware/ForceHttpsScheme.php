<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttpsScheme
{
    public function handle(Request $request, Closure $next)
    {
        // Force HTTPS scheme for all tenant requests
        if (app()->environment('production')) {
            $request->server->set('HTTPS', 'on');
            $request->server->set('SERVER_PORT', 443);
        }
        
        return $next($request);
    }
}
