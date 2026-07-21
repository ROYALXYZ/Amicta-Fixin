<?php

namespace App\Enums;

enum TicketStatus: string
{
    case WaitingDispatch = 'MENUNGGU_DISPATCH';
    case Assigned = 'DITUGASKAN';
    case InProgress = 'DALAM_PENGERJAAN';
    case Completed = 'SELESAI';
    case Cancelled = 'DIBATALKAN';
}
