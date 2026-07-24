<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\URL::forceScheme('https');
        
        // Force Ziggy to use HTTPS
        if ($this->app->environment('production')) {
            config(['app.url' => str_replace('http://', 'https://', config('app.url'))]);
        }
        
        Vite::prefetch(concurrency: 3);
    }
}
