import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const MenuIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const LogOutIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const UserIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="8" r="4" /></svg>;
const LayoutDashboardIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9 5h7v2h-7v-2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Building2Icon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16M10 21v-4a2 2 0 0 1 4 0v4M8 7h.01M16 7h.01M12 7h.01M8 11h.01M16 11h.01M12 11h.01M8 15h.01M16 15h.01M12 15h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const FileTextIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" /></svg>;

type LayoutUser = { name: string; role: string; phone_number?: string; username?: string };

export default function AuthenticatedLayout({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user as LayoutUser;
    const currentRoute = route().current();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = (() => {
        if (user.role === 'PLATFORM_OWNER') return [{ name: 'platform.organizations.index', label: 'Organisasi', icon: <Building2Icon className="h-4 w-4" /> }];
        if (user.role === 'ADMIN') return [
            { name: 'admin.tickets.index', label: 'Dashboard Tiket', icon: <LayoutDashboardIcon className="h-4 w-4" /> },
        ];
        if (user.role === 'TECHNICIAN') return [{ name: 'technician.tickets.index', label: 'Work Order', icon: <WrenchIcon className="h-4 w-4" /> }];
        // Resident
        return [{ name: 'resident.tickets.index', label: 'Laporan Saya', icon: <FileTextIcon className="h-4 w-4" /> }];
    })();

    const displayRole = user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
            <aside id="sidebar-menu" aria-label="Sidebar Navigation" aria-hidden={!sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024} className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 shadow-sm ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center">
                            <WrenchIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-900 text-sm tracking-tight">Fix<span className="text-violet-700">In</span></p>
                            <p className="text-slate-500 text-xs">{displayRole}</p>
                        </div>
                    </div>
                    {/* Mobile close button inside drawer for a11y */}
                    <button className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu navigasi" aria-expanded={sidebarOpen}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item, idx) => {
                        const active = item.name && currentRoute === item.name;
                        return (
                            <Link key={idx} href={route(item.name)} onClick={() => setSidebarOpen(false)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-violet-100 text-violet-900 ring-1 ring-violet-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                                {item.icon} {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                            <Link href={route('profile.edit')} className="text-xs text-slate-500 hover:text-violet-700 transition-colors">Edit Profil</Link>
                        </div>
                        <Link href={route('logout')} method="post" as="button" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900">
                            <LogOutIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {sidebarOpen && <div className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-6 sticky top-0 z-10 shadow-sm">
                    <button className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors focus:ring-2 focus:ring-violet-500" onClick={() => setSidebarOpen(true)} aria-controls="sidebar-menu" aria-expanded={sidebarOpen} aria-label="Buka menu navigasi">
                        <MenuIcon className="h-5 w-5" />
                    </button>
                    {header && <div className="font-bold text-slate-900 text-base">{header}</div>}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 ml-auto">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
