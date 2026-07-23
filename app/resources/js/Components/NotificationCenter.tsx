import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

type NotificationItem = { id: string; title: string; message: string; event: string | null; ticket_id: number | null; read_at: string | null; created_at: string | null };
type NotificationProps = { unreadCount: number; items: NotificationItem[] };

export default function NotificationCenter() {
    const notifications = (usePage().props.notifications ?? { unreadCount: 0, items: [] }) as NotificationProps;
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const formatTime = (value: string | null) => value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '';

    return <div className="relative" ref={panelRef}>
        <Button type="button" variant="outline" size="icon" className="relative" aria-label={`Notifikasi${notifications.unreadCount ? `, ${notifications.unreadCount} belum dibaca` : ''}`} onClick={() => setOpen((value) => !value)}>
            <Bell className="size-4" />
            {notifications.unreadCount > 0 && <Badge className="absolute -right-2 -top-2 min-w-5 justify-center rounded-full px-1.5 py-0 text-[10px]">{notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}</Badge>}
        </Button>
        {open && <section className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-background shadow-xl" aria-label="Pusat notifikasi">
            <div className="flex items-center justify-between border-b px-4 py-3"><div><h3 className="text-sm font-semibold">Notifikasi</h3><p className="text-xs text-muted-foreground">Aktivitas terbaru laporan Anda</p></div><button type="button" className="text-xs font-medium text-primary hover:underline disabled:opacity-50" disabled={!notifications.unreadCount} onClick={() => router.post(route('notifications.read-all'), {}, { preserveScroll: true })}>Tandai semua dibaca</button></div>
            <div className="max-h-[min(30rem,70vh)] overflow-y-auto">
                {notifications.items.length === 0 ? <div className="px-6 py-12 text-center"><Bell className="mx-auto size-8 text-muted-foreground/50" /><p className="mt-3 text-sm font-medium">Belum ada notifikasi</p><p className="mt-1 text-xs text-muted-foreground">Perubahan laporan akan muncul di sini.</p></div> : notifications.items.map((item) => <div key={item.id} className={`border-b px-4 py-3 last:border-0 ${item.read_at ? 'bg-background' : 'bg-primary/[0.04]'}`}><div className="flex gap-3"><span className={`mt-1 size-2 shrink-0 rounded-full ${item.read_at ? 'bg-muted' : 'bg-primary'}`} aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.message}</p><p className="mt-2 text-[11px] text-muted-foreground">{formatTime(item.created_at)}</p></div><div className="flex shrink-0 items-start gap-1"><button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Tandai dibaca" onClick={() => router.post(route('notifications.read', item.id), {}, { preserveScroll: true })}><Check className="size-3.5" /></button>{item.ticket_id && <Link href={route('dashboard')} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Buka tiket ${item.ticket_id}`} onClick={() => setOpen(false)}><ExternalLink className="size-3.5" /></Link>}</div></div></div>)}
            </div>
        </section>}
    </div>;
}
