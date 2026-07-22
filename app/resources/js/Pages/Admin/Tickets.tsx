import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { useOrganizationRealtime } from '@/hooks/useOrganizationRealtime';

const FileTextIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ClockIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const CheckCircleIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const PlusIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ZapIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WindIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DropletsIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 16.3c0 2.59 2.24 4.7 5 4.7s5-2.11 5-4.7c0-2.59-5-9.3-5-9.3s-5 6.71-5 9.3z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Building2Icon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16M10 21v-4a2 2 0 0 1 4 0v4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SearchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;

function CategoryIcon({ name, className }: { name: string; className?: string }) {
    if (name.includes('Listrik')) return <ZapIcon className={className || 'text-amber-500'} />;
    if (name.includes('AC')) return <WindIcon className={className || 'text-blue-500'} />;
    if (name.includes('Air')) return <DropletsIcon className={className || 'text-cyan-500'} />;
    return <Building2Icon className={className || 'text-stone-500'} />;
}

type TicketPhoto = { type: string; mime_type: string; url: string; created_at: string | null };
type WorkNote = { body: string; created_at: string | null };
type TicketRowType = {
    id: number; status: string; issue_category: { name: string }; custom_issue_category: string | null;
    building: { name: string }; unit: { number: string }; reporter: { name: string; phone_number: string };
    technician: { name: string } | null; description: string; priority: string | null;
    submitted_at: string | null; assigned_at: string | null; started_at: string | null; completed_at: string | null;
    photo_urls?: TicketPhoto[]; work_notes?: WorkNote[];
};
type TicketPage = { data: TicketRowType[]; current_page: number; last_page: number; per_page: number; total: number };

export default function Tickets({ tickets, statusCounts, technicians }: { tickets: TicketPage; statusCounts: Record<string, number>; technicians: { id: number; name: string }[] }) {
    useOrganizationRealtime('tickets.changed', ['tickets', 'statusCounts', 'technicians']);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedTicket, setSelectedTicket] = useState<TicketRowType | null>(null);
    const [loadingTicket, setLoadingTicket] = useState<number | null>(null);

    const stat = (status: string) => statusCounts[status] ?? 0;
    const filteredTickets = tickets.data.filter((ticket) => {
        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
        const haystack = `${ticket.id} ${ticket.custom_issue_category ?? ticket.issue_category.name} ${ticket.building.name} ${ticket.unit.number} ${ticket.reporter.name} ${ticket.technician?.name ?? ''} ${ticket.description}`.toLowerCase();
        const matchesQuery = query.trim() === '' || haystack.includes(query.toLowerCase());
        return matchesStatus && matchesQuery;
    });

    const statCards = [
        { label: 'Total Tiket', value: tickets.total, icon: <FileTextIcon className="h-4 w-4 text-slate-500" /> },
        { label: 'Menunggu', value: stat('MENUNGGU_DISPATCH'), icon: <ClockIcon className="h-4 w-4 text-slate-500" /> },
        { label: 'Diproses', value: stat('DALAM_PENGERJAAN') + stat('DITUGASKAN'), icon: <WrenchIcon className="h-4 w-4 text-slate-500" /> },
        { label: 'Selesai', value: stat('SELESAI'), icon: <CheckCircleIcon className="h-4 w-4 text-slate-500" /> },
    ];

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Dashboard Admin</h2>}><Head title="Admin" />
        <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Tiket</h1>
                    <p className="text-slate-500">Pantau antrean, assignment teknisi, dan status penyelesaian.</p>
                </div>
                <Button asChild className="gap-2"><Link href={route('admin.technicians.index')}><PlusIcon className="h-4 w-4" /> Kelola Tukang</Link></Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, icon }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            {icon}
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader><CardTitle>Distribusi Status Laporan</CardTitle><CardDescription>Komposisi seluruh tiket organisasi.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {[
                        ['Menunggu dispatch', 'MENUNGGU_DISPATCH', 'bg-amber-500'], ['Ditugaskan', 'DITUGASKAN', 'bg-blue-500'], ['Dalam pengerjaan', 'DALAM_PENGERJAAN', 'bg-violet-500'], ['Selesai', 'SELESAI', 'bg-emerald-500'], ['Dibatalkan', 'DIBATALKAN', 'bg-slate-400'],
                    ].map(([label, status, color]) => { const value = stat(status); const percentage = tickets.total ? Math.round(value / tickets.total * 100) : 0; return <div key={status} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-3 text-sm"><span>{label}</span><div className="h-3 overflow-hidden rounded-full bg-muted"><div className={`${color} h-full rounded-full`} style={{ width: `${percentage}%` }} /></div><span className="text-right font-medium">{value}</span></div>; })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Filter Status:</span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {(['ALL', 'MENUNGGU_DISPATCH', 'DITUGASKAN', 'DALAM_PENGERJAAN', 'SELESAI', 'DIBATALKAN']).map(s => (
                                    <SelectItem key={s} value={s}>
                                        {s === 'ALL' ? 'Semua Status' : s.replaceAll('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative w-full md:w-72">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input placeholder="Cari ID, Unit, Nama..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {['ID Tiket', 'Dilaporkan', 'Pelapor', 'Unit', 'Kategori', 'Teknisi', 'Status', 'Aksi'].map(h => <TableHead key={h}>{h}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map(ticket => (
                                <TableRow key={ticket.id} className="cursor-pointer" onClick={() => openTicket(ticket.id)}>
                                    <TableCell className="font-mono text-xs font-semibold text-slate-700">#{ticket.id}</TableCell>
                                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">{ticket.submitted_at ? new Date(ticket.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</TableCell>
                                    <TableCell>{ticket.reporter.name}</TableCell>
                                    <TableCell>{ticket.building.name} {ticket.unit.number}</TableCell>
                                    <TableCell><div className="flex items-center gap-2"><CategoryIcon name={ticket.custom_issue_category ?? ticket.issue_category.name} className="h-4 w-4" />{ticket.custom_issue_category ?? ticket.issue_category.name}</div></TableCell>
                                    <TableCell>{ticket.technician ? <span>{ticket.technician.name}</span> : <span className="text-xs italic text-slate-400">Belum ada</span>}</TableCell>
                                    <TableCell><Status status={ticket.status} /></TableCell>
                                    <TableCell><Button variant="outline" size="sm" disabled={loadingTicket === ticket.id} onClick={(e) => { e.stopPropagation(); openTicket(ticket.id); }}>{loadingTicket === ticket.id ? 'Memuat...' : 'Buka'}</Button></TableCell>
                                </TableRow>
                            ))}
                            {filteredTickets.length === 0 && <TableRow><TableCell colSpan={8} className="h-24 text-center text-slate-500">Tidak ada tiket ditemukan</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{tickets.total} tiket</span><div className="flex items-center gap-1.5"><span className="mr-1 text-xs text-muted-foreground">Tampilkan</span>{[5, 10, 15, 20].map((size) => <Link key={size} href={route('admin.tickets.index', { per_page: size })} className={`inline-flex size-8 items-center justify-center rounded-md border text-xs font-medium ${tickets.per_page === size ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>{size}</Link>)}{tickets.last_page > 1 && <><Button asChild variant="outline" size="icon" className="ml-1 size-8" disabled={tickets.current_page === 1}><Link aria-label="Halaman sebelumnya" href={route('admin.tickets.index', { page: tickets.current_page - 1, per_page: tickets.per_page })}>←</Link></Button><Button asChild variant="outline" size="icon" className="size-8" disabled={tickets.current_page === tickets.last_page}><Link aria-label="Halaman berikutnya" href={route('admin.tickets.index', { page: tickets.current_page + 1, per_page: tickets.per_page })}>→</Link></Button></>}</div></div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent className="max-w-5xl">
                    {selectedTicket && <TicketDetail ticket={selectedTicket} technicians={technicians} onClose={() => setSelectedTicket(null)} />}
                </DialogContent>
            </Dialog>

        </div>
    </AuthenticatedLayout>;

    async function openTicket(id: number) {
        setLoadingTicket(id);
        try { const response = await window.axios.get<TicketRowType>(route('admin.tickets.show', id)); setSelectedTicket(response.data); }
        catch { window.alert('Detail tiket gagal dimuat. Coba lagi.'); }
        finally { setLoadingTicket(null); }
    }
}

function TicketDetail({ ticket, technicians, onClose }: { ticket: TicketRowType; technicians: { id: number; name: string }[]; onClose: () => void }) {
    const dispatch = useForm({ technician_id: '', priority: 'SEDANG' });
    const cancel = useForm({ reason: '' });
    const damagePhotos = (ticket.photo_urls ?? []).filter((p) => p.type === 'KERUSAKAN');
    const completionPhotos = (ticket.photo_urls ?? []).filter((p) => p.type === 'PENYELESAIAN');
    const fmtTime = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

    return <div className="space-y-6">
        <DialogHeader>
            <div className="flex items-center gap-3"><Badge variant="outline">#{ticket.id}</Badge><Status status={ticket.status} /></div>
            <DialogTitle>Detail Tiket</DialogTitle>
            <DialogDescription>Kelola penugasan dan pantau progres work order.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-sm">Info Pelapor</CardTitle></CardHeader><CardContent className="space-y-3"><div><p className="font-semibold">{ticket.reporter.name}</p><p className="text-sm text-slate-500">{ticket.reporter.phone_number}</p></div><div><p className="text-xs text-slate-500">Unit Terkait</p><p className="font-medium">{ticket.building.name} {ticket.unit.number}</p></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Detail Masalah</CardTitle></CardHeader><CardContent><div className="mb-2 flex items-center gap-2"><CategoryIcon name={ticket.custom_issue_category ?? ticket.issue_category.name} className="h-4 w-4" /><span className="font-semibold">{ticket.custom_issue_category ?? ticket.issue_category.name}</span></div><p className="text-sm text-slate-700">{ticket.description}</p>{damagePhotos.length > 0 && <div className="mt-3 flex gap-2">{damagePhotos.map((p) => <a key={p.url} href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt="Kerusakan" className="h-16 w-16 rounded-md border object-cover" /></a>)}</div>}</CardContent></Card>
        </div>

        <Card>
            <CardHeader><CardTitle className="text-sm">Progres & Penugasan</CardTitle></CardHeader>
            <CardContent>
                {ticket.status === 'MENUNGGU_DISPATCH' ? (
                    <form onSubmit={(e) => { e.preventDefault(); dispatch.post(route('admin.tickets.dispatch', ticket.id), { onSuccess: onClose }); }} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2"><Label>Pilih Teknisi</Label><Select value={dispatch.data.technician_id} onValueChange={(value) => dispatch.setData('technician_id', value)}><SelectTrigger><SelectValue placeholder="-- Pilih --" /></SelectTrigger><SelectContent>{technicians.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label>Prioritas</Label><Select value={dispatch.data.priority} onValueChange={(value) => dispatch.setData('priority', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TINGGI">TINGGI</SelectItem><SelectItem value="SEDANG">SEDANG</SelectItem><SelectItem value="RENDAH">RENDAH</SelectItem></SelectContent></Select></div>
                        </div>
                        <Button disabled={dispatch.processing} className="w-full">{dispatch.processing ? 'Menugaskan...' : 'Tugaskan Work Order'}</Button>
                    </form>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div><p className="text-xs text-slate-500">Teknisi Ditugaskan</p><p className="mt-0.5 font-semibold">{ticket.technician?.name || '-'}</p><div className="mt-4 space-y-1.5 text-xs"><p className="flex justify-between text-slate-600"><span>Dilaporkan</span> <span className="font-medium text-slate-900">{fmtTime(ticket.submitted_at)}</span></p><p className="flex justify-between text-slate-600"><span>Ditugaskan</span> <span className="font-medium text-slate-900">{fmtTime(ticket.assigned_at)}</span></p><p className="flex justify-between text-slate-600"><span>Mulai Dikerjakan</span> <span className="font-medium text-slate-900">{fmtTime(ticket.started_at)}</span></p><p className="flex justify-between text-slate-600"><span>Selesai</span> <span className="font-medium text-emerald-600">{fmtTime(ticket.completed_at)}</span></p></div></div>
                        <div><p className="mb-2 text-xs text-slate-500">Catatan Pengerjaan</p>{ticket.work_notes && ticket.work_notes.length > 0 ? <div className="space-y-2">{ticket.work_notes.map((n, i) => <div key={i} className="rounded-md border bg-slate-50 p-3 text-xs"><p className="font-medium text-slate-700">{n.body}</p><p className="mt-1 text-slate-400">{fmtTime(n.created_at)}</p></div>)}</div> : <p className="text-sm italic text-slate-400">Belum ada catatan</p>}{completionPhotos.length > 0 && <div className="mt-3 flex gap-2">{completionPhotos.map((p) => <a key={p.url} href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt="Selesai" className="h-16 w-16 rounded-md border object-cover" /></a>)}</div>}</div>
                    </div>
                )}
            </CardContent>
        </Card>

        {!['SELESAI', 'DIBATALKAN'].includes(ticket.status) && <Card className="border-red-200"><CardHeader><CardTitle className="text-sm text-red-700">Zona Bahaya</CardTitle></CardHeader><CardContent><form onSubmit={(e) => { e.preventDefault(); cancel.post(route('admin.tickets.cancel', ticket.id), { onSuccess: onClose }); }} className="flex gap-2"><Input required placeholder="Alasan pembatalan (fiktif, ganda, dll)" value={cancel.data.reason} onChange={e => cancel.setData('reason', e.target.value)} className="border-red-200" /><Button variant="outline" disabled={cancel.processing} className="border-red-200 text-red-600 hover:bg-red-50">Batalkan Tiket</Button></form></CardContent></Card>}
    </div>;
}

function Status({ status }: { status: string }) {
    const map: Record<string, string> = {
        MENUNGGU_DISPATCH: 'bg-amber-100 text-amber-900 border-amber-200',
        DITUGASKAN: 'bg-blue-100 text-blue-900 border-blue-200',
        DALAM_PENGERJAAN: 'bg-violet-100 text-violet-900 border-violet-200',
        SELESAI: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        DIBATALKAN: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return <Badge variant="outline" className={map[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
