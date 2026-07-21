<?php

namespace App\Enums;

enum TicketPriority: string
{
    case High = 'TINGGI';
    case Medium = 'SEDANG';
    case Low = 'RENDAH';
}
