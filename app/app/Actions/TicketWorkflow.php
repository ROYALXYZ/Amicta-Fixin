<?php

namespace App\Actions;

use App\Enums\TicketPhotoType;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\Ticket;
use App\Models\TicketPhoto;
use App\Models\TicketStatusHistory;
use App\Models\TicketWorkNote;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class TicketWorkflow
{
    public function create(Organization $organization, User $reporter, array $data, UploadedFile $damagePhoto): Ticket
    {
        $path = null;

        try {
            return DB::transaction(function () use ($organization, $reporter, $data, $damagePhoto, &$path): Ticket {
                $ticket = Ticket::query()->create([
                    ...$data,
                    'organization_id' => $organization->id,
                    'reporter_id' => $reporter->id,
                    'status' => TicketStatus::WaitingDispatch,
                ]);

                $path = $this->storePhoto($organization, $ticket, TicketPhotoType::Damage, $damagePhoto);
                $this->recordPhoto($organization, $ticket, TicketPhotoType::Damage, $damagePhoto, $path, $reporter);
                $this->recordStatus($organization, $ticket, null, TicketStatus::WaitingDispatch, $reporter);

                return $ticket;
            });
        } catch (\Throwable $exception) {
            if ($path !== null) {
                Storage::disk('supabase')->delete($path);
            }

            throw $exception;
        }
    }

    public function dispatch(Organization $organization, Ticket $ticket, User $admin, User $technician, string $priority): void
    {
        $this->assertStatus($ticket, TicketStatus::WaitingDispatch);
        $this->assertTenantUser($organization, $technician, UserRole::Technician);

        DB::transaction(function () use ($organization, $ticket, $admin, $technician, $priority): void {
            $oldStatus = $ticket->status;
            $ticket->update([
                'priority' => $priority,
                'technician_id' => $technician->id,
                'status' => TicketStatus::Assigned,
            ]);
            $this->recordStatus($organization, $ticket, $oldStatus, TicketStatus::Assigned, $admin);
        });
    }

    public function start(Organization $organization, Ticket $ticket, User $technician): void
    {
        $this->assertAssignee($ticket, $technician);
        $this->assertStatus($ticket, TicketStatus::Assigned);

        DB::transaction(function () use ($organization, $ticket, $technician): void {
            $oldStatus = $ticket->status;
            $ticket->update(['status' => TicketStatus::InProgress]);
            $this->recordStatus($organization, $ticket, $oldStatus, TicketStatus::InProgress, $technician);
        });
    }

    public function addNote(Organization $organization, Ticket $ticket, User $technician, string $body): void
    {
        $this->assertAssignee($ticket, $technician);
        $this->assertStatus($ticket, TicketStatus::InProgress);

        TicketWorkNote::query()->create([
            'organization_id' => $organization->id,
            'ticket_id' => $ticket->id,
            'technician_id' => $technician->id,
            'body' => $body,
        ]);
    }

    public function complete(Organization $organization, Ticket $ticket, User $technician, UploadedFile $completionPhoto): void
    {
        $this->assertAssignee($ticket, $technician);
        $this->assertStatus($ticket, TicketStatus::InProgress);
        $path = null;

        try {
            DB::transaction(function () use ($organization, $ticket, $technician, $completionPhoto, &$path): void {
                $path = $this->storePhoto($organization, $ticket, TicketPhotoType::Completion, $completionPhoto);
                $this->recordPhoto($organization, $ticket, TicketPhotoType::Completion, $completionPhoto, $path, $technician);

                $oldStatus = $ticket->status;
                $ticket->update(['status' => TicketStatus::Completed]);
                $this->recordStatus($organization, $ticket, $oldStatus, TicketStatus::Completed, $technician);
            });
        } catch (\Throwable $exception) {
            if ($path !== null) {
                Storage::disk('supabase')->delete($path);
            }

            throw $exception;
        }
    }

    public function cancel(Organization $organization, Ticket $ticket, User $admin, string $reason): void
    {
        if (in_array($ticket->status, [TicketStatus::Completed, TicketStatus::Cancelled], true)) {
            throw ValidationException::withMessages(['ticket' => 'Tiket dengan status final tidak dapat dibatalkan.']);
        }

        DB::transaction(function () use ($organization, $ticket, $admin, $reason): void {
            $oldStatus = $ticket->status;
            $ticket->update([
                'status' => TicketStatus::Cancelled,
                'cancellation_reason' => $reason,
                'cancelled_by' => $admin->id,
                'cancelled_at' => now(),
            ]);
            $this->recordStatus($organization, $ticket, $oldStatus, TicketStatus::Cancelled, $admin, $reason);
        });
    }

    private function storePhoto(Organization $organization, Ticket $ticket, TicketPhotoType $type, UploadedFile $photo): string
    {
        $extension = $photo->extension() ?: 'jpg';
        $path = "organizations/{$organization->id}/tickets/{$ticket->id}/{$type->value}.{$extension}";

        Storage::disk('supabase')->put($path, $photo->getContent(), ['visibility' => 'private', 'ContentType' => $photo->getMimeType()]);

        return $path;
    }

    private function recordPhoto(Organization $organization, Ticket $ticket, TicketPhotoType $type, UploadedFile $photo, string $path, User $user): void
    {
        TicketPhoto::query()->create([
            'organization_id' => $organization->id,
            'ticket_id' => $ticket->id,
            'type' => $type,
            'storage_path' => $path,
            'mime_type' => $photo->getMimeType(),
            'size_bytes' => $photo->getSize(),
            'uploaded_by' => $user->id,
        ]);
    }

    private function recordStatus(Organization $organization, Ticket $ticket, ?TicketStatus $oldStatus, TicketStatus $newStatus, User $user, ?string $note = null): void
    {
        TicketStatusHistory::query()->create([
            'organization_id' => $organization->id,
            'ticket_id' => $ticket->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $user->id,
            'note' => $note,
        ]);
    }

    private function assertStatus(Ticket $ticket, TicketStatus $expected): void
    {
        if ($ticket->status !== $expected) {
            throw ValidationException::withMessages(['ticket' => 'Transisi status tiket tidak valid.']);
        }
    }

    private function assertAssignee(Ticket $ticket, User $technician): void
    {
        if ($ticket->technician_id !== $technician->id) {
            abort(403);
        }
    }

    private function assertTenantUser(Organization $organization, User $user, UserRole $role): void
    {
        if ($user->organization_id !== $organization->id || $user->role !== $role || ! $user->is_active) {
            throw ValidationException::withMessages(['technician_id' => 'Teknisi tidak valid untuk organisasi ini.']);
        }
    }
}
