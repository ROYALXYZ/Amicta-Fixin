<?php

namespace App\Enums;

enum TicketPhotoType: string
{
    case Damage = 'KERUSAKAN';
    case Completion = 'PENYELESAIAN';
}
