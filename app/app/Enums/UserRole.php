<?php

namespace App\Enums;

enum UserRole: string
{
    case PlatformOwner = 'PLATFORM_OWNER';
    case Admin = 'ADMIN';
    case Resident = 'RESIDENT';
    case Technician = 'TECHNICIAN';
}
