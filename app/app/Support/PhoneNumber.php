<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

class PhoneNumber
{
    public static function normalize(string $value): string
    {
        $number = preg_replace('/\D+/', '', $value) ?? '';

        if (str_starts_with($number, '0')) {
            $number = '62'.substr($number, 1);
        }

        if (! preg_match('/^62\d{8,13}$/', $number)) {
            throw ValidationException::withMessages([
                'phone_number' => 'Masukkan nomor WhatsApp Indonesia yang valid.',
            ]);
        }

        return $number;
    }
}
