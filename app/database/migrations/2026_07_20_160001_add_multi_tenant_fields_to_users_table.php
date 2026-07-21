<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('username', 50)->unique()->after('name');
            $table->string('phone_number', 20)->unique()->after('username');
            $table->string('role', 32)->default(UserRole::Resident->value)->after('password');
            $table->boolean('is_active')->default(true)->after('role');
            $table->index(['organization_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'role']);
            $table->dropConstrainedForeignId('organization_id');
            $table->dropUnique(['username']);
            $table->dropUnique(['phone_number']);
            $table->dropColumn(['username', 'phone_number', 'role', 'is_active']);
        });
    }
};
