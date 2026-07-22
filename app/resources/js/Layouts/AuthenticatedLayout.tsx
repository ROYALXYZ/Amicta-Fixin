import { Link, usePage } from '@inertiajs/react';
import { Building2, FileText, LayoutDashboard, LogOut, User, UsersRound, Wrench } from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/Components/ui/sidebar';

type LayoutUser = { name: string; role: string; phone_number?: string; username?: string };

export default function AuthenticatedLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user as LayoutUser;
    const currentRoute = route().current();
    const navItems = (() => {
        if (user.role === 'PLATFORM_OWNER') return [{ name: 'platform.organizations.index', label: 'Organisasi', icon: Building2 }];
        if (user.role === 'ADMIN') return [
            { name: 'admin.tickets.index', label: 'Dashboard Tiket', icon: LayoutDashboard },
            { name: 'admin.locations.index', label: 'Gedung & Unit', icon: Building2 },
            { name: 'admin.technicians.index', label: 'Manajemen Tukang', icon: UsersRound },
        ];
        if (user.role === 'TECHNICIAN') return [{ name: 'technician.tickets.index', label: 'Work Order', icon: Wrench }];
        return [
            { name: 'resident.dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { name: 'resident.tickets.index', label: 'Laporan Saya', icon: FileText },
        ];
    })();
    const displayRole = user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <SidebarProvider>
            <Sidebar collapsible="offcanvas">
                <SidebarHeader>
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Wrench className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold tracking-tight">FixIn</p>
                            <p className="text-xs text-muted-foreground">{displayRole}</p>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigasi</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={currentRoute === item.name} tooltip={item.label}>
                                            <Link href={route(item.name)}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Edit profil">
                                <Link href={route('profile.edit')}>
                                    <User />
                                    <span className="truncate">{user.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Keluar">
                                <Link href={route('logout')} method="post" as="button">
                                    <LogOut />
                                    <span>Keluar</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
                    <SidebarTrigger aria-label="Buka atau tutup navigasi" />
                    {header && <div className="text-base font-semibold">{header}</div>}
                </header>
                <main className="min-w-0 flex-1">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
