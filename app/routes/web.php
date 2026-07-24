<?php

use App\Http\Controllers\AdminTicketController;
use App\Http\Controllers\AdminTechnicianController;
use App\Http\Controllers\PlatformOrganizationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResidentTicketController;
use App\Http\Controllers\TechnicianTicketController;
use App\Http\Controllers\UrgentTicketController;
use App\Http\Controllers\TelegramAuditController;
use App\Http\Controllers\NotificationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::pattern('organization', '[0-9]+');
Route::pattern('building', '[0-9]+');
Route::pattern('unit', '[0-9]+');
Route::pattern('technician', '[0-9]+');
Route::pattern('ticket', '[0-9]+');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'ownerMode' => ! request()->attributes->get('organization'),
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    if (!auth()->check()) {
        return redirect()->route('login');
    }
    return redirect()->route(match (auth()->user()->role->value) {
        'RESIDENT' => 'resident.dashboard', 'ADMIN' => 'admin.tickets.index', 'TECHNICIAN' => 'technician.tickets.index', default => 'platform.organizations.index',
    });
})->name('dashboard');

Route::get('/urgent', [UrgentTicketController::class, 'create'])->name('urgent.create');
Route::post('/urgent', [UrgentTicketController::class, 'store'])->name('urgent.store');

Route::post('/integrations/telegram/audit/webhook', [TelegramAuditController::class, 'webhook'])
    ->middleware(\App\Http\Middleware\VerifyTelegramWebhookSecret::class);

Route::middleware(['auth', 'tenant.user'])->group(function () {
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
});

Route::middleware(['auth', 'tenant.user'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'tenant.user', 'role:RESIDENT'])->prefix('resident')->name('resident.')->group(function () {
    Route::get('/dashboard', [ResidentTicketController::class, 'dashboard'])->name('dashboard');
    Route::get('/tickets', [ResidentTicketController::class, 'index'])->name('tickets.index');
    Route::post('/tickets', [ResidentTicketController::class, 'store'])->name('tickets.store');
});

Route::middleware(['auth', 'tenant.user', 'role:TECHNICIAN'])->prefix('technician')->name('technician.')->group(function () {
    Route::get('/tickets', [TechnicianTicketController::class, 'index'])->name('tickets.index');
    Route::get('/history', [TechnicianTicketController::class, 'history'])->name('history.index');
    Route::post('/tickets/{ticket}/start', [TechnicianTicketController::class, 'start'])->name('tickets.start');
    Route::post('/tickets/{ticket}/notes', [TechnicianTicketController::class, 'note'])->name('tickets.note');
    Route::post('/tickets/{ticket}/complete', [TechnicianTicketController::class, 'complete'])->name('tickets.complete');
});

Route::middleware(['auth', 'tenant.user', 'role:ADMIN'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/tickets', [AdminTicketController::class, 'index'])->name('tickets.index');
    Route::post('/tickets/bulk-dispatch', [AdminTicketController::class, 'bulkDispatch'])->name('tickets.bulk-dispatch');
    Route::post('/tickets/bulk-cancel', [AdminTicketController::class, 'bulkCancel'])->name('tickets.bulk-cancel');
    Route::get('/locations', [AdminTicketController::class, 'locations'])->name('locations.index');
    Route::get('/tickets/{ticket}', [AdminTicketController::class, 'show'])->name('tickets.show');
    Route::get('/technicians', [AdminTechnicianController::class, 'index'])->name('technicians.index');
    Route::post('/buildings', [AdminTicketController::class, 'building'])->name('buildings.store');
    Route::post('/units', [AdminTicketController::class, 'unit'])->name('units.store');
    Route::patch('/buildings/{building}', [AdminTicketController::class, 'updateBuilding'])->name('buildings.update');
    Route::patch('/buildings/{building}/toggle', [AdminTicketController::class, 'toggleBuilding'])->name('buildings.toggle');
    Route::patch('/units/{unit}', [AdminTicketController::class, 'updateUnit'])->name('units.update');
    Route::patch('/units/{unit}/toggle', [AdminTicketController::class, 'toggleUnit'])->name('units.toggle');
    Route::post('/units/bulk-toggle', [AdminTicketController::class, 'bulkToggleUnits'])->name('units.bulk-toggle');
    Route::post('/technicians', [AdminTechnicianController::class, 'store'])->name('technicians.store');
    Route::patch('/technicians/{technician}', [AdminTechnicianController::class, 'update'])->name('technicians.update');
    Route::patch('/technicians/{technician}/toggle', [AdminTechnicianController::class, 'toggle'])->name('technicians.toggle');
    Route::delete('/technicians/{technician}', [AdminTechnicianController::class, 'destroy'])->name('technicians.destroy');
    Route::post('/tickets/{ticket}/dispatch', [AdminTicketController::class, 'dispatch'])->name('tickets.dispatch');
    Route::post('/tickets/{ticket}/cancel', [AdminTicketController::class, 'cancel'])->name('tickets.cancel');
});

Route::middleware(['auth', 'tenant.user', 'role:PLATFORM_OWNER'])
    ->prefix('platform')
    ->name('platform.')
    ->group(function () {
        Route::get('/organizations', [PlatformOrganizationController::class, 'index'])
            ->name('organizations.index');
        Route::post('/organizations', [PlatformOrganizationController::class, 'store'])
            ->name('organizations.store');
        Route::patch('/organizations/{organization}', [PlatformOrganizationController::class, 'update'])
            ->name('organizations.update');
        Route::patch('/organizations/{organization}/toggle', [PlatformOrganizationController::class, 'toggle'])
            ->name('organizations.toggle');
    });

require __DIR__.'/auth.php';
