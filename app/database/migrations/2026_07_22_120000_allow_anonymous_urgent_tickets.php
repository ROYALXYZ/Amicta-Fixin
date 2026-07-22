<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('reporter_id')->nullable()->change();
            $table->string('reporter_name')->nullable()->after('reporter_id');
            $table->string('reporter_phone', 30)->nullable()->after('reporter_name');
        });

        Schema::table('ticket_status_histories', function (Blueprint $table) {
            $table->foreignId('changed_by')->nullable()->change();
        });

        Schema::table('ticket_photos', function (Blueprint $table) {
            $table->foreignId('uploaded_by')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ticket_status_histories', function (Blueprint $table) {
            $table->foreignId('changed_by')->nullable(false)->change();
        });

        Schema::table('ticket_photos', function (Blueprint $table) {
            $table->foreignId('uploaded_by')->nullable(false)->change();
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['reporter_name', 'reporter_phone']);
            $table->foreignId('reporter_id')->nullable(false)->change();
        });
    }
};
