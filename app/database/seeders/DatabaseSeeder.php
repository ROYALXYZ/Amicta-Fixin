<?php

namespace Database\Seeders;

use App\Models\IssueCategory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        IssueCategory::query()->updateOrCreate(
            ['code' => 'LAINNYA'],
            ['name' => 'Lainnya', 'is_active' => true],
        );

        $this->call(DemoTenantSeeder::class);
    }
}
