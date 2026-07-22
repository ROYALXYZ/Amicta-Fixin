<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrganizationTechniciansChanged implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly int $organizationId, public readonly string $action) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("organization.{$this->organizationId}")];
    }

    public function broadcastAs(): string
    {
        return 'technicians.changed';
    }

    public function broadcastWith(): array
    {
        return ['action' => $this->action];
    }
}
