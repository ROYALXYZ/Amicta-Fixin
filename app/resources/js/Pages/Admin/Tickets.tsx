import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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
import { Checkbox } from '@/Components/ui/checkbox';
import { useOrganizationRealtime } from '@/hooks/useOrganizationRealtime';
import { toast } from 'sonner';
import { CircleAlert, TriangleAlert, Zap } from 'lucide-react';

const FileTextIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ClockIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const CheckCircleIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const PlusIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WindIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DropletsIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 16.3c0 2.59 2.24 4.7 5 4.7s5-2.11 5-4.7c0-2.59-5-9.3-5-9.3s-5 6.71-5 9.3z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Building2Icon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16M10 21v-4a2 2 0 0 1 4 0v4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SearchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;

function CategoryIcon({ name, className }: { name: string; className?: string }) {
    if (name.includes('Listrik')) return <Zap className={className || 'text-primary'} />;
    if (name.includes('AC')) return <WindIcon className={className || 'text-primary'} />;
    if (name.includes('Air')) return <DropletsIcon className={className || 'text-primary'} />;
    return <Building2Icon className={className || 'text-primary'} />;
}

function formatTicketAge(iso: string | null) {
    if (!iso) return '-';
    const hours = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000));
    if (hours < 1) return 'Baru saja';
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Kemarin' : `${days} hari lalu`;
}

type TicketPhoto = { type: string; mime_type: string; url: string; created_at: string | null };
type WorkNote = { body: string; created_at: string | null };
type TicketRowType = {
    id: number; status: string; issue_category: { name: string }; custom_issue_category: string | null; is_urgent: boolean;
    building: { name: string }; unit: { number: string }; reporter: { name: string; phone_number: string } | null; reporter_name: string | null; reporter_phone: string | null;
    technician: { name: string } | null; description: string; priority: string | null;
    submitted_at: string | null; assigned_at: string | null; started_at: string | null; completed_at: string | null;
    photo_urls?: TicketPhoto[]; work_notes?: WorkNote[];
};
type TicketPage = { data: TicketRowType[]; current_page: number; last_page: number; per_page: number; total: number };
const statusLabels: Record<string, string> = { ALL: 'Semua Status', MENUNGGU_DISPATCH: 'Menunggu Dispatch', DITUGASKAN: 'Ditugaskan', DALAM_PENGERJAAN: 'Dalam Pengerjaan', SELESAI: 'Selesai', DIBATALKAN: 'Dibatalkan' };

export default function Tickets({ tickets, statusCounts, urgentCount, technicians }: { tickets: TicketPage; statusCounts: Record<string, number>; urgentCount: number; technicians: { id: number; name: string }[] }) {
    useOrganizationRealtime('tickets.changed', ['tickets', 'statusCounts', 'technicians']);
    const params = new URLSearchParams(window.location.search);
    const [query, setQuery] = useState(params.get('query') ?? '');
    const [statusFilter, setStatusFilter] = useState(params.get('status') ?? 'ALL');
    const [urgentFilter, setUrgentFilter] = useState(params.get('urgent') === '1' ? 'URGENT' : params.get('urgent') === '0' ? 'REGULAR' : 'ALL');
    const urgentOnly = urgentFilter === 'URGENT';
    const urgentQuery = urgentFilter === 'URGENT' ? 1 : urgentFilter === 'REGULAR' ? 0 : undefined;
    const [selectedTicket, setSelectedTicket] = useState<TicketRowType | null>(null);
    const [loadingTicket, setLoadingTicket] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<'dispatch' | 'cancel' | null>(null);
    const bulkDispatch = useForm({ ticket_ids: [] as number[], technician_id: '', priority: 'SEDANG' });
    const bulkCancel = useForm({ ticket_ids: [] as number[], reason: '' });
    const filtersReady = useRef(false);

    const stat = (status: string) => statusCounts[status] ?? 0;
    useEffect(() => {
        if (!filtersReady.current) {
            filtersReady.current = true;
            return;
        }

        const timer = window.setTimeout(() => {
            router.get(route('admin.tickets.index'), { page: 1, query: query || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter, urgent: urgentQuery, per_page: tickets.per_page }, { preserveState: true, preserveScroll: true, replace: true });
        }, 250);
        return () => window.clearTimeout(timer);
    }, [query, statusFilter, urgentFilter]);

    const filteredTickets = tickets.data;
    const pageIds = filteredTickets.map((ticket) => ticket.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    const togglePage = () => setSelectedIds(allPageSelected ? selectedIds.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...selectedIds, ...pageIds])));
    const toggleTicket = (id: number) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    const submitBulkDispatch = () => { bulkDispatch.setData('ticket_ids', selectedIds); bulkDispatch.post(route('admin.tickets.bulk-dispatch'), { onSuccess: () => { setSelectedIds([]); setBulkAction(null); toast.success(`${selectedIds.length} tiket berhasil ditugaskan.`); }, onError: () => toast.error('Penugasan gagal. Tidak ada perubahan disimpan.') }); };
    const submitBulkCancel = () => { bulkCancel.setData('ticket_ids', selectedIds); bulkCancel.post(route('admin.tickets.bulk-cancel'), { onSuccess: () => { setSelectedIds([]); setBulkAction(null); toast.success(`${selectedIds.length} tiket berhasil dibatalkan.`); }, onError: () => toast.error('Pembatalan gagal. Tidak ada perubahan disimpan.') }); };

    const statCards = [
        { label: 'Total Tiket', value: tickets.total, note: 'Seluruh laporan organisasi', icon: <div className="rounded-full bg-primary/10 p-2.5"><FileTextIcon className="h-4 w-4 text-primary" /></div> },
        { label: 'Urgent', value: urgentCount, note: urgentCount ? 'Perlu perhatian segera' : 'Tidak ada antrean urgent', icon: <div className="rounded-full bg-primary/10 p-2.5"><CircleAlert className="h-4 w-4 text-primary" /></div>, urgent: true },
        { label: 'Menunggu Dispatch', value: stat('MENUNGGU_DISPATCH'), note: 'Siap ditugaskan ke teknisi', icon: <div className="rounded-full bg-primary/10 p-2.5"><ClockIcon className="h-4 w-4 text-primary" /></div> },
        { label: 'Sedang Diproses', value: stat('DALAM_PENGERJAAN') + stat('DITUGASKAN'), note: `${stat('SELESAI')} tiket selesai`, icon: <div className="rounded-full bg-primary/10 p-2.5"><WrenchIcon className="h-4 w-4 text-primary" /></div> },
    ];

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Dashboard Admin</h2>}><Head title="Admin" />
        <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Tiket</h1>
                    <p className="text-slate-500">Pantau antrean, assignment teknisi, dan status penyelesaian.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {urgentCount > 0 && <Button variant="outline" className={urgentOnly ? 'gap-2 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'gap-2 border-rose-200 text-rose-700 hover:bg-rose-50'} onClick={() => { setUrgentFilter(urgentOnly ? 'ALL' : 'URGENT'); setStatusFilter('ALL'); }}><CircleAlert className="h-4 w-4" /> {urgentOnly ? 'Tampilkan semua tiket' : `Lihat ${urgentCount} tiket urgent`}</Button>}
                    <Button asChild variant="outline" className="gap-2"><Link href={route('admin.technicians.index')}><PlusIcon className="h-4 w-4" /> Kelola Teknisi</Link></Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, value, note, icon, urgent }) => (
                    <Card key={label} className={urgent ? 'border-rose-200 bg-rose-50/45' : undefined}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                            <CardTitle className={urgent ? 'text-sm font-medium text-rose-700' : 'text-sm font-medium text-slate-700'}>{label}</CardTitle>
                            {icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-slate-950">{value}</div>
                            <p className={urgent ? 'mt-3 text-xs text-rose-700' : 'mt-3 text-xs text-slate-500'}>{note}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className={urgentCount > 0 ? 'border-rose-200 bg-rose-50/40' : undefined}>
                <CardHeader><CardTitle>Distribusi Status Laporan</CardTitle><CardDescription>{urgentOnly ? 'Komposisi tiket urgent yang sedang ditampilkan.' : query || statusFilter !== 'ALL' || urgentFilter !== 'ALL' ? 'Komposisi tiket sesuai filter aktif.' : 'Komposisi seluruh tiket organisasi.'}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {[
                        ['Menunggu dispatch', 'MENUNGGU_DISPATCH'], ['Ditugaskan', 'DITUGASKAN'], ['Dalam pengerjaan', 'DALAM_PENGERJAAN'], ['Selesai', 'SELESAI'], ['Dibatalkan', 'DIBATALKAN'],
                    ].map(([label, status]) => { const value = stat(status); const percentage = tickets.total ? Math.round(value / tickets.total * 100) : 0; const barColor = { MENUNGGU_DISPATCH: 'bg-amber-400', DITUGASKAN: 'bg-blue-500', DALAM_PENGERJAAN: 'bg-violet-500', SELESAI: 'bg-emerald-500', DIBATALKAN: 'bg-red-500' }[status] ?? 'bg-primary'; return <div key={status} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-3 text-sm"><span>{label}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${barColor}`} style={{ width: `${percentage}%` }} /></div><span className="text-right font-medium">{value}</span></div>; })}
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col gap-4 border-b bg-slate-50/50 px-5 py-5 md:flex-row md:items-center md:justify-between lg:px-6">
                     <div className="flex flex-wrap items-center gap-2">
<Checkbox aria-label="Pilih semua tiket di halaman" checked={allPageSelected} onCheckedChange={togglePage} />
                        <span className="text-sm font-medium text-slate-500">Filter Status:</span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {(['ALL', 'MENUNGGU_DISPATCH', 'DITUGASKAN', 'DALAM_PENGERJAAN', 'SELESAI', 'DIBATALKAN']).map(s => (
                                    <SelectItem key={s} value={s}>
                                         {statusLabels[s]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                         <Select value={urgentFilter} onValueChange={setUrgentFilter}>
                             <SelectTrigger className="w-[160px]" aria-label="Filter urgensi">
                                 <SelectValue placeholder="Semua Urgensi" />
                             </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="ALL">Semua Urgensi</SelectItem>
                                 <SelectItem value="URGENT">Urgent</SelectItem>
                                 <SelectItem value="REGULAR">Reguler</SelectItem>
                             </SelectContent>
                         </Select>
                    </div>
                    <div className="relative w-full md:w-72">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input placeholder="Cari ID, Unit, Nama..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-primary/5">
                                 {['', 'Tiket', 'Masalah', 'Lokasi', 'Dilaporkan', 'Teknisi', 'Status', 'Aksi'].map(h => <TableHead key={h} className="h-12 whitespace-nowrap px-5 text-xs font-bold uppercase tracking-wider text-primary">{h}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map(ticket => (
                                 <TableRow key={ticket.id} className="h-16 border-slate-100">
                                       <TableCell className="px-5"><Checkbox aria-label={`Pilih tiket #${ticket.id}`} checked={selectedIds.includes(ticket.id)} onCheckedChange={() => toggleTicket(ticket.id)} /></TableCell><TableCell className="whitespace-nowrap px-5 align-middle font-mono text-xs font-semibold text-slate-700"><div className="flex flex-wrap items-center gap-1.5"> <span>#{ticket.id}</span>{ticket.is_urgent && <span title="Tiket urgent" className="inline-flex size-5 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700"><CircleAlert className="size-3" aria-hidden="true" /><span className="sr-only">Urgent</span></span>}{!ticket.is_urgent && ticket.priority === 'TINGGI' && <span title="Prioritas tinggi" className="inline-flex size-5 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-800"><TriangleAlert className="size-3" aria-hidden="true" /><span className="sr-only">Prioritas tinggi</span></span>}</div></TableCell>
                                    <TableCell className="max-w-[20rem] px-5"><div className="flex items-start gap-2"><CategoryIcon name={ticket.custom_issue_category ?? ticket.issue_category.name} className="mt-0.5 h-4 w-4 shrink-0" /><div className="min-w-0"><p className="truncate font-medium text-slate-800">{ticket.custom_issue_category ?? ticket.issue_category.name}</p><p className="truncate text-xs text-slate-500">{ticket.description}</p></div></div></TableCell>
                                    <TableCell className="whitespace-nowrap px-5 text-slate-700"><p>{ticket.building.name}</p><p className="text-xs text-slate-500">Unit {ticket.unit.number}</p></TableCell>
                                    <TableCell className="whitespace-nowrap px-5 text-xs text-slate-500">{formatTicketAge(ticket.submitted_at)}</TableCell>
                                    <TableCell className="whitespace-nowrap px-5">{ticket.technician ? <span className="text-slate-700">{ticket.technician.name}</span> : <span className="text-xs italic text-slate-400">Belum ada</span>}</TableCell>
                                    <TableCell className="whitespace-nowrap px-5"><Status status={ticket.status} /></TableCell>
                                    <TableCell className="px-5"><Button variant="outline" size="sm" disabled={loadingTicket === ticket.id} onClick={() => openTicket(ticket.id)}>{loadingTicket === ticket.id ? 'Memuat...' : 'Buka'}</Button></TableCell>
                                </TableRow>
                            ))}
                             {filteredTickets.length === 0 && <TableRow><TableCell colSpan={8} className="h-48 text-center"><div className="flex flex-col items-center justify-center space-y-3"><div className="rounded-full bg-primary/10 p-3"><FileTextIcon className="h-6 w-6 text-primary" /></div><p className="text-sm font-medium text-slate-900">Belum ada tiket ditemukan</p><p className="text-xs text-slate-500">Coba sesuaikan filter atau kata kunci pencarian Anda.</p></div></TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    </div>
                     {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 border-b bg-violet-50 px-5 py-3 text-sm"><span className="mr-auto font-medium text-violet-900">{selectedIds.length} tiket dipilih</span><Button size="sm" onClick={() => setBulkAction('dispatch')}>Tugaskan Teknisi</Button><Button size="sm" variant="outline" className="border-red-200 text-red-600" onClick={() => setBulkAction('cancel')}>Batalkan</Button><Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Bersihkan</Button></div>}
                     <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-slate-50/50 px-5 py-4 text-sm lg:px-6"><span className="text-muted-foreground">{tickets.total} tiket</span><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted-foreground">Tampilkan</span>{[5, 10, 15, 20].map((size) => <Link key={size} href={route('admin.tickets.index', { per_page: size, query: query || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter, urgent: urgentQuery })} className={`inline-flex size-9 items-center justify-center rounded-md border text-xs font-medium ${tickets.per_page === size ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>{size}</Link>)}{tickets.last_page > 1 && <><Button asChild variant="outline" size="icon" className="ml-1 size-9" disabled={tickets.current_page === 1}><Link aria-label="Halaman sebelumnya" href={route('admin.tickets.index', { page: tickets.current_page - 1, per_page: tickets.per_page, query: query || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter, urgent: urgentQuery })}>←</Link></Button><Button asChild variant="outline" size="icon" className="size-9" disabled={tickets.current_page === tickets.last_page}><Link aria-label="Halaman berikutnya" href={route('admin.tickets.index', { page: tickets.current_page + 1, per_page: tickets.per_page, query: query || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter, urgent: urgentQuery })}>→</Link></Button></>}</div></div>
                </CardContent>
            </Card>

            <Dialog open={bulkAction === 'dispatch'} onOpenChange={(open) => !open && setBulkAction(null)}><DialogContent><DialogHeader><DialogTitle>Tugaskan Teknisi</DialogTitle><DialogDescription>{selectedIds.length} tiket akan ditugaskan.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); submitBulkDispatch(); }} className="space-y-4"><Select value={bulkDispatch.data.technician_id} onValueChange={(value) => bulkDispatch.setData('technician_id', value)}><SelectTrigger><SelectValue placeholder="Pilih teknisi" /></SelectTrigger><SelectContent>{technicians.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent></Select><Select value={bulkDispatch.data.priority} onValueChange={(value) => bulkDispatch.setData('priority', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['TINGGI', 'SEDANG', 'RENDAH'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select><Button disabled={bulkDispatch.processing || !bulkDispatch.data.technician_id} className="w-full">{bulkDispatch.processing ? 'Menugaskan...' : 'Konfirmasi Penugasan'}</Button></form></DialogContent></Dialog>
            <Dialog open={bulkAction === 'cancel'} onOpenChange={(open) => !open && setBulkAction(null)}><DialogContent><DialogHeader><DialogTitle>Batalkan Tiket</DialogTitle><DialogDescription>{selectedIds.length} tiket akan dibatalkan. Tindakan ini tidak dapat dipulihkan.</DialogDescription></DialogHeader><form onSubmit={(e) => { e.preventDefault(); submitBulkCancel(); }} className="space-y-4"><Input required placeholder="Alasan pembatalan" value={bulkCancel.data.reason} onChange={(e) => bulkCancel.setData('reason', e.target.value)} /><Button disabled={bulkCancel.processing || !bulkCancel.data.reason.trim()} variant="destructive" className="w-full">{bulkCancel.processing ? 'Membatalkan...' : 'Konfirmasi Pembatalan'}</Button></form></DialogContent></Dialog>

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
             <div className="flex items-center gap-3"><Badge variant="outline">#{ticket.id}</Badge>{ticket.is_urgent && <Badge variant="outline" className="rounded-full border-red-200 bg-red-50 text-red-700"><CircleAlert className="mr-1 h-3 w-3" aria-hidden="true" />URGENT</Badge>}<Status status={ticket.status} /></div>
            <DialogTitle>Detail Tiket</DialogTitle>
            <DialogDescription>Kelola penugasan dan pantau progres work order.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-sm">Info Pelapor</CardTitle></CardHeader><CardContent className="space-y-3"><div><p className="font-semibold">{ticket.reporter?.name ?? ticket.reporter_name ?? 'Pelapor urgent'}</p><p className="text-sm text-slate-500">{ticket.reporter?.phone_number ?? ticket.reporter_phone ?? '-'}</p></div><div><p className="text-xs text-slate-500">Unit Terkait</p><p className="font-medium">{ticket.building.name} {ticket.unit.number}</p></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Detail Masalah</CardTitle></CardHeader><CardContent><div className="mb-2 flex items-center gap-2"><CategoryIcon name={ticket.custom_issue_category ?? ticket.issue_category.name} className="h-4 w-4" /><span className="font-semibold">{ticket.custom_issue_category ?? ticket.issue_category.name}</span></div><p className="text-sm text-slate-700">{ticket.description}</p>{damagePhotos.length > 0 && <div className="mt-3 flex gap-2">{damagePhotos.map((p) => <a key={p.url} href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt="Kerusakan" className="h-16 w-16 rounded-md border object-cover" /></a>)}</div>}</CardContent></Card>
        </div>

        <Card>
            <CardHeader><CardTitle className="text-sm">Progres & Penugasan</CardTitle></CardHeader>
            <CardContent>
                {ticket.status === 'MENUNGGU_DISPATCH' ? (
                    <form onSubmit={(e) => { e.preventDefault(); dispatch.post(route('admin.tickets.dispatch', ticket.id), { onSuccess: () => { onClose(); toast.success('Tiket berhasil ditugaskan.'); }, onError: () => toast.error('Penugasan tiket gagal.') }); }} className="space-y-4">
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

        {!['SELESAI', 'DIBATALKAN'].includes(ticket.status) && <Card className="border-red-200"><CardHeader><CardTitle className="text-sm text-red-700">Zona Bahaya</CardTitle></CardHeader><CardContent><form onSubmit={(e) => { e.preventDefault(); cancel.post(route('admin.tickets.cancel', ticket.id), { onSuccess: () => { onClose(); toast.success('Tiket berhasil dibatalkan.'); }, onError: () => toast.error('Pembatalan tiket gagal.') }); }} className="flex gap-2"><Input required placeholder="Alasan pembatalan (fiktif, ganda, dll)" value={cancel.data.reason} onChange={e => cancel.setData('reason', e.target.value)} className="border-red-200" /><Button variant="outline" disabled={cancel.processing} className="border-red-200 text-red-600 hover:bg-red-50">Batalkan Tiket</Button></form></CardContent></Card>}
    </div>;
}

function Status({ status }: { status: string }) {
    const map: Record<string, string> = {
        MENUNGGU_DISPATCH: 'bg-amber-100 text-amber-900 border-amber-200',
        DITUGASKAN: 'bg-blue-100 text-blue-900 border-blue-200',
        DALAM_PENGERJAAN: 'bg-violet-100 text-violet-900 border-violet-200',
        SELESAI: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        DIBATALKAN: 'bg-red-50 text-red-700 border-red-200'
    };
    return <Badge variant="outline" className={`rounded-full ${map[status]}`}>{statusLabels[status] ?? status}</Badge>;
}
