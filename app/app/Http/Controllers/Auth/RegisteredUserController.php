<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        abort_unless(request()->attributes->has('organization'), 404);

        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $organization = $request->attributes->get('organization');

        abort_unless($organization !== null, 404);

        $phoneNumber = PhoneNumber::normalize((string) $request->input('phone_number'));
        $request->merge(['phone_number' => $phoneNumber]);

        $request->validate([
            'name' => 'required|string|max:120',
            'username' => 'required|string|max:50|alpha_dash|unique:'.User::class,
            'phone_number' => 'required|string|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'phone_number' => $phoneNumber,
            'email' => $phoneNumber.'@local.invalid',
            'password' => Hash::make($request->password),
            'organization_id' => $organization->id,
            'role' => UserRole::Resident,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
