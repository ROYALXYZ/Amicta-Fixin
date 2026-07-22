import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock3, FileText, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useOrganizationRealtime } from '@/hooks/useOrganizationRealtime';

type Ticket = {
    id: number;
    status: string;
    description: string;
    custom_issue_category: string | null;
    cancellation_reason: string | null;
    building: { name: string };
    unit: { number: string };
    issue_category: { name: string };
    status_histories: { new_status: string; note: string | null; created_at: string; changed_by: { name: string } | null }[];
};

type Props = {
    summary: { total: number; pending: number; inProgress: number; completed: number };
    recentTickets: { data: Ticket[]; current_page: number; last_page: number; per_page: number; total: number };
};

const statusClass: Record<string, string> = {
    MENUNGGU_DISPATCH: 'border-amber-200 bg-amber-100 text-amber-800',
    DITUGASKAN: 'border-blue-200 bg-blue-100 text-blue-800',
    DALAM_PENGERJAAN: 'border-violet-200 bg-violet-100 text-violet-800',
    SELESAI: 'border-emerald-200 bg-emerald-100 text-emerald-800',
    DIBATALKAN: 'border-slate-200 bg-slate-100 text-slate-700',
};

export default function Dashboard({ summary, recentTickets }: Props) {
    useOrganizationRealtime('tickets.changed', ['summary', 'recentTickets']);
    const user = usePage().props.auth.user as { name: string };
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const stats = [
        { label: 'Total Laporan', value: summary.total, icon: FileText },
        { label: 'Menunggu / Ditugaskan', value: summary.pending, icon: Clock3 },
        { label: 'Sedang Dikerjakan', value: summary.inProgress, icon: Wrench },
        { label: 'Selesai', value: summary.completed, icon: CheckCircle2 },
    ];

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Dashboard Penghuni</h2>}>
        <Head title="Dashboard Penghuni" />
        <div className="mx-auto max-w-6xl space-y-8 p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><h1 className="text-2xl font-bold tracking-tight">Halo, {user.name.split(' ')[0]}</h1><p className="mt-1 text-sm text-muted-foreground">Pantau status laporan perbaikan Anda.</p></div>
                <Button asChild><Link href={`${route('resident.tickets.index')}#buat-laporan`}>Buat Laporan</Link></Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /></CardHeader><CardContent><p className="text-2xl font-bold">{value}</p></CardContent></Card>)}
            </div>
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Laporan Terbaru</CardTitle><CardDescription>Status laporan terakhir Anda.</CardDescription></div><Button variant="outline" asChild><Link href={route('resident.tickets.index')}>Lihat Semua Laporan</Link></Button></CardHeader>
                <CardContent>{recentTickets.data.length ? <><div className="divide-y rounded-md border">{recentTickets.data.map((ticket) => <button type="button" key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="flex w-full flex-col gap-3 p-4 text-left transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-medium">#{ticket.id} · {ticket.custom_issue_category ?? ticket.issue_category.name}</p><p className="mt-1 truncate text-sm text-muted-foreground">{ticket.building.name} · Unit {ticket.unit.number} · {ticket.description}</p></div><Badge variant="outline" className={`w-fit shrink-0 ${statusClass[ticket.status]}`}>{ticket.status.replaceAll('_', ' ')}</Badge></button>)}</div><Pagination page={recentTickets} routeName="resident.dashboard" /></> : <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center"><FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" /><div><p className="font-medium">Belum ada laporan</p><p className="mt-1 text-sm text-muted-foreground">Kirim laporan pertama Anda saat menemukan kerusakan.</p></div><Button asChild><Link href={`${route('resident.tickets.index')}#buat-laporan`}>Buat Laporan</Link></Button></div>}</CardContent>
            </Card>
            <TicketDialog ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        </div>
    </AuthenticatedLayout>;
}

function Pagination({ page, routeName }: { page: { current_page: number; last_page: number; per_page: number; total: number }; routeName: string }) {
    return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{page.total} laporan</span><div className="flex items-center gap-2"><select aria-label="Jumlah laporan per halaman" className="h-9 rounded-md border bg-background px-2" value={page.per_page} onChange={(event) => window.location.assign(route(routeName, { per_page: event.target.value }))}>{[5, 10, 25].map((size) => <option key={size} value={size}>{size} / halaman</option>)}</select>{page.last_page > 1 && <><Button asChild variant="outline" size="sm" disabled={page.current_page === 1}><Link href={route(routeName, { page: page.current_page - 1, per_page: page.per_page })}>Sebelumnya</Link></Button><Button asChild variant="outline" size="sm" disabled={page.current_page === page.last_page}><Link href={route(routeName, { page: page.current_page + 1, per_page: page.per_page })}>Berikutnya</Link></Button></>}</div></div>;
}

function TicketDialog({ ticket, onClose }: { ticket: Ticket | null; onClose: () => void }) {
    return <Dialog open={!!ticket} onOpenChange={(open) => !open && onClose()}><DialogContent>{ticket && <><DialogHeader><DialogTitle>Detail Laporan #{ticket.id}</DialogTitle><DialogDescription>{ticket.issue_category.name} · {ticket.building.name} · Unit {ticket.unit.number}</DialogDescription></DialogHeader><p className="text-sm">{ticket.description}</p>{ticket.status === 'DIBATALKAN' && ticket.cancellation_reason && <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3"><p className="text-sm font-medium text-destructive">Alasan pembatalan</p><p className="mt-1 text-sm">{ticket.cancellation_reason}</p></div>}<div className="space-y-3"><p className="text-sm font-medium">Status & pesan</p>{ticket.status_histories.map((history, index) => <div key={`${history.created_at}-${index}`} className="rounded-md border p-3"><div className="flex items-center justify-between gap-3"><Badge variant="outline" className={statusClass[history.new_status]}>{history.new_status.replaceAll('_', ' ')}</Badge><span className="text-xs text-muted-foreground">{new Date(history.created_at).toLocaleString('id-ID')}</span></div>{history.note && <p className="mt-2 text-sm">{history.note}</p>}<p className="mt-2 text-xs text-muted-foreground">Diperbarui oleh {history.changed_by?.name ?? 'Sistem'}</p></div>)}</div></>}</DialogContent></Dialog>;
}
