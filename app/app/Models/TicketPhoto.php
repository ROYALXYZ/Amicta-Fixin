<?php

namespace App\Models;

use App\Enums\TicketPhotoType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketPhoto extends Model
{
    public const UPDATED_AT = null;

    protected $hidden = ['storage_path'];

    protected $fillable = [
        'organization_id',
        'ticket_id',
        'type',
        'storage_path',
        'mime_type',
        'size_bytes',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return ['type' => TicketPhotoType::class];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
