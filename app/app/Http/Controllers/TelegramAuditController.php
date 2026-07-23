<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Services\TelegramBot;
use App\Support\AuditMessageFormatter;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TelegramAuditController extends Controller
{
    public function webhook(Request $request, TelegramBot $telegram)
    {
        $this->handleUpdate($request->input(), $telegram);

        return response()->json(['ok' => true]);
    }

    public function handleUpdate(array $update, TelegramBot $telegram): void
    {
        $message = $update['message'] ?? [];
        $chatId = (string) data_get($message, 'chat.id', '');
        $userId = (string) data_get($message, 'from.id', '');
        $text = trim((string) data_get($message, 'text', ''));

        $organizationId = collect(config('telegram.audit.chat_ids', []))
            ->filter(fn ($configuredChatId): bool => (string) $configuredChatId === $chatId)
            ->keys()
            ->first();

        if (blank($organizationId) || ! in_array($userId, config('telegram.audit.allowed_user_ids', []), true)) {
            return;
        }

        $this->reply($telegram, $chatId, $this->command($text, (int) $organizationId));
    }

    private function command(string $text, int $organizationId): string
    {
        [$command, $argument] = array_pad(preg_split('/\s+/', $text, 2) ?: [], 2, '');
        $command = strtolower(explode('@', $command, 2)[0]);
        $query = ActivityLog::query()->where('organization_id', $organizationId)->with('actor')->latest('created_at')->latest('id');

        if ($command === '/ticket' && ctype_digit($argument)) {
            $logs = $query->where('subject_type', 'Ticket')->where('subject_id', $argument)->limit(20)->get();
        } elseif ($command === '/today' || ($command === '/recap' && ($argument === '' || $argument === 'today'))) {
            $logs = $query->whereDate('created_at', today())->limit(30)->get();
        } elseif ($command === '/search' && filled($argument)) {
            $logs = $query->where(function ($q) use ($argument): void {
                $q->where('description', 'like', "%{$argument}%")->orWhere('action', 'like', "%{$argument}%");
            })->limit(30)->get();
        } elseif ($command === '/recap' && preg_match('/^(\d{4}-\d{2}-\d{2})\s+(\d{4}-\d{2}-\d{2})$/', $argument, $matches)) {
            $logs = $query->whereBetween('created_at', [Carbon::parse($matches[1])->startOfDay(), Carbon::parse($matches[2])->endOfDay()])->limit(50)->get();
        } elseif ($command === '/help') {
            return "/today\n/ticket 1042\n/search kata\n/recap today\n/recap 2026-07-01 2026-07-23";
        } else {
            return 'Command tidak valid. Gunakan /help.';
        }

        if ($logs->isEmpty()) return 'Tidak ada aktivitas ditemukan.';

        return $logs->map(fn (ActivityLog $log): string => AuditMessageFormatter::format($log, true))->implode("\n");
    }

    private function reply(TelegramBot $telegram, string $chatId, string $text): void
    {
        $telegram->sendMessage((string) config('telegram.audit.token'), $chatId, $text);
    }
}
