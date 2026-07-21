<?php

namespace Database\Seeders;

use App\Models\IssueCategory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'AC' => 'AC',
            'LISTRIK' => 'Listrik',
            'PIPA' => 'Pipa',
            'SIPIL' => 'Sipil',
            'LAINNYA' => 'Lainnya',
        ] as $code => $name) {
            IssueCategory::query()->updateOrCreate(
                ['code' => $code],
                ['name' => $name, 'is_active' => true],
            );
        }

        $this->call(DemoTenantSeeder::class);
    }
}
