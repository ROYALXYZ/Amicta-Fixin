import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { useOrganizationRealtime } from '@/hooks/useOrganizationRealtime';
import { toast } from 'sonner';

const CheckCircleIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const ZapIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WindIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DropletsIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 16.3c0 2.59 2.24 4.7 5 4.7s5-2.11 5-4.7c0-2.59-5-9.3-5-9.3s-5 6.71-5 9.3z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Building2Icon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16M10 21v-4a2 2 0 0 1 4 0v4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SearchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;

function CategoryIcon({ name, className }: { name: string; className?: string }) {
    if (name.includes('Listrik')) return <ZapIcon className={className || "text-primary"} />;
    if (name.includes('AC')) return <WindIcon className={className || "text-primary"} />;
    if (name.includes('Air')) return <DropletsIcon className={className || "text-primary"} />;
    return <Building2Icon className={className || "text-primary"} />;
}

type WorkNote = { body: string; created_at: string | null };
type TicketPhoto = { type: string; url: string; created_at: string | null };
type TicketRowType = {
    id: number; status: string; priority: string; is_urgent: boolean;
    issue_category: { name: string }; building: { name: string }; unit: { number: string }; reporter?: { name: string; username?: string; phone_number?: string } | null;
    description: string;
    submitted_at: string | null; assigned_at: string | null; started_at: string | null; completed_at: string | null;
    photo_urls?: TicketPhoto[]; work_notes?: WorkNote[];
};

const fmt = (iso: string | null | undefined) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export default function Tickets({ tickets, completedCount }: { tickets: TicketRowType[]; completedCount: number }) {
    useOrganizationRealtime('tickets.changed', ['tickets']);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [urgencyFilter, setUrgencyFilter] = useState('ALL');
    const [timeFilter, setTimeFilter] = useState('ALL');
    const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
    const hasActiveFilters = query.trim() !== '' || statusFilter !== 'ALL' || urgencyFilter !== 'ALL' || timeFilter !== 'ALL';

    const filteredTickets = tickets.filter((ticket) => {
        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
        const matchesUrgency = urgencyFilter === 'ALL' || (urgencyFilter === 'URGENT' ? ticket.is_urgent : !ticket.is_urgent);
        const age = ticket.submitted_at ? Date.now() - new Date(ticket.submitted_at).getTime() : Number.POSITIVE_INFINITY;
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const submittedAt = ticket.submitted_at ? new Date(ticket.submitted_at).getTime() : 0;
        const matchesTime = timeFilter === 'ALL' || (timeFilter === 'TODAY' ? submittedAt >= startOfToday : timeFilter === 'WEEK' ? age <= 7 * 86_400_000 : age <= 30 * 86_400_000);
        const haystack = `${ticket.id} ${ticket.issue_category.name} ${ticket.building.name} ${ticket.unit.number} ${ticket.description} ${ticket.reporter?.name ?? ''} ${ticket.reporter?.username ?? ''} ${ticket.reporter?.phone_number ?? ''}`.toLowerCase();
        const matchesQuery = query.trim() === '' || haystack.includes(query.toLowerCase());
        return matchesStatus && matchesUrgency && matchesTime && matchesQuery;
    });

    const active = filteredTickets.filter((t) => !['SELESAI', 'DIBATALKAN'].includes(t.status));

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Dashboard Teknisi</h2>}><Head title="Work Order" /><div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tugas Lapangan</h1>
                <p className="text-slate-500">Lihat work order aktif, tambahkan catatan, dan unggah bukti penyelesaian.</p>
            </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-2">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-slate-700">Tugas Aktif</CardTitle>
                    <div className="rounded-full bg-primary/10 p-2.5"><WrenchIcon className="h-4 w-4 text-primary" /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-slate-950">{active.length}</div>
                    <p className="mt-3 text-xs text-slate-500">Pekerjaan saat ini</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-slate-700">Diselesaikan</CardTitle>
                     <div className="rounded-full bg-primary/10 p-2.5"><CheckCircleIcon className="h-4 w-4 text-primary" /></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-slate-950">{completedCount}</div>
                    <p className="mt-3 text-xs text-slate-500">Pekerjaan selesai</p>
                </CardContent>
            </Card>
        </div>

         <Card className="p-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
             <div className="flex flex-wrap items-center gap-2">
                 <span className="text-sm font-medium text-slate-500">Filter Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {[['ALL', 'Semua Status'], ['DITUGASKAN', 'Baru'], ['DALAM_PENGERJAAN', 'Proses']].map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label} {value === 'ALL' ? `(${tickets.length})` : `(${tickets.filter((t) => t.status === value).length})`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
                 <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                     <SelectTrigger className="w-[150px]" aria-label="Filter urgensi"><SelectValue placeholder="Semua Urgensi" /></SelectTrigger>
                     <SelectContent><SelectItem value="ALL">Semua Urgensi</SelectItem><SelectItem value="URGENT">Urgent</SelectItem><SelectItem value="REGULAR">Reguler</SelectItem></SelectContent>
                 </Select>
                 <Select value={timeFilter} onValueChange={setTimeFilter}>
                     <SelectTrigger className="w-[155px]" aria-label="Filter waktu masuk"><SelectValue placeholder="Semua Waktu" /></SelectTrigger>
                     <SelectContent><SelectItem value="ALL">Semua Waktu</SelectItem><SelectItem value="TODAY">Masuk Hari Ini</SelectItem><SelectItem value="WEEK">7 Hari Terakhir</SelectItem><SelectItem value="MONTH">30 Hari Terakhir</SelectItem></SelectContent>
                 </Select>
             </div>
            <div className="relative w-full sm:w-64 ml-auto">
                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input type="text" placeholder="Cari gedung, unit, ID..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
        </Card>

        {active.length > 0 ? (
             <section className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                 {active.map((t) => <WorkCard key={t.id} ticket={t} expanded={expandedTicketId === t.id} onToggle={() => setExpandedTicketId((id) => id === t.id ? null : t.id)} />)}
            </section>
        ) : (
            <Card className="py-16 text-center shadow-sm">
                <CardContent>
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                     <p className="text-lg font-bold text-slate-900">{hasActiveFilters ? 'Tidak Ada Tugas yang Cocok' : 'Semua Tugas Selesai!'}</p>
                     <p className="mt-1 text-sm text-slate-500">{hasActiveFilters ? 'Coba ubah status, urgensi, waktu masuk, atau kata pencarian.' : 'Tidak ada work order aktif saat ini.'}</p>
                </CardContent>
            </Card>
        )}

    </div></AuthenticatedLayout>;
}

function WorkCard({ ticket, expanded, onToggle }: { ticket: TicketRowType; expanded: boolean; onToggle: () => void }) {
    const note = useForm({ body: '' });
    const completion = useForm({ completion_photo: null as File | null, work_note: '' });

    const selectPhoto = (file: File | null) => {
        if (!file) return;
        if (!['image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
            completion.setError('completion_photo', 'Gunakan foto JPEG/WebP maksimal 2 MB.');
            return;
        }
        completion.clearErrors('completion_photo');
        completion.setData('completion_photo', file);
    };

    const priorityColor = ticket.priority === 'TINGGI' ? 'bg-red-100 text-red-900 border-red-300' : ticket.priority === 'SEDANG' ? 'bg-orange-100 text-orange-900 border-orange-300' : 'bg-slate-100 text-slate-900 border-slate-300';
    const preview = completion.data.completion_photo ? URL.createObjectURL(completion.data.completion_photo) : null;
    const workNotes = ticket.work_notes ?? [];
    const damagePhotos = (ticket.photo_urls ?? []).filter((p) => p.type === 'KERUSAKAN');

    return <Card className="flex h-fit flex-col overflow-hidden self-start">
        <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`ticket-${ticket.id}-details`}
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900">Unit {ticket.unit.number}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{ticket.building.name} · {ticket.issue_category.name} · #{ticket.id}</p>
                    <p className="truncate text-xs text-slate-400">Pelapor: {ticket.reporter?.name ?? 'Pelapor urgent'}</p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {ticket.priority === 'TINGGI' && <Badge variant="outline" className={`text-[10px] tracking-wider ${priorityColor}`}>Prioritas Tinggi</Badge>}
                <svg viewBox="0 0 24 24" className={`size-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
        </button>

        {expanded && <div id={`ticket-${ticket.id}-details`}>
        <CardContent className="border-t border-slate-100 p-6 pb-4">
            <div className="mb-3 flex justify-between items-start">
                <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{ticket.unit.number}</p>
                    <p className="text-sm font-semibold text-slate-500 mt-1">{ticket.building.name}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <CategoryIcon name={ticket.issue_category.name} className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-900 text-sm">{ticket.issue_category.name}</span>
                <span className="text-slate-300 mx-1">•</span>
                <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
            </div>

            <p className="line-clamp-3 text-sm text-slate-600 mb-4">{ticket.description}</p>
            {damagePhotos.length > 0 && <div className="mb-4 flex gap-2">{damagePhotos.map((p) => <a key={p.url} href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt="Kerusakan" className="h-12 w-12 object-cover rounded-md border border-slate-200" /></a>)}</div>}

            <div className="mt-auto space-y-1 text-xs text-slate-500 mb-4">
                {ticket.assigned_at && <p>Ditugaskan: <span className="font-medium text-slate-700">{fmt(ticket.assigned_at)}</span></p>}
                {ticket.started_at && <p>Mulai: <span className="font-medium text-slate-700">{fmt(ticket.started_at)}</span></p>}
            </div>

            {workNotes.length > 0 && (
                <div className="mb-4 space-y-1.5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">CATATAN</p>
                    {workNotes.map((n, i) => <div key={i} className="rounded-md bg-slate-50 p-3 text-xs border border-slate-100"><p className="text-slate-700 font-medium">{n.body}</p><p className="mt-1 text-slate-400">{fmt(n.created_at)}</p></div>)}
                </div>
            )}
        </CardContent>

        <div className="border-t border-slate-100 p-6 bg-slate-50/50 mt-auto rounded-b-xl">
        {ticket.status === 'DITUGASKAN' && <form onSubmit={(e) => { e.preventDefault(); note.post(route('technician.tickets.start', ticket.id), { onSuccess: () => toast.success('Pengerjaan dimulai.'), onError: () => toast.error('Gagal memulai pengerjaan.') }); }}><Button disabled={note.processing} className="w-full">Mulai Pengerjaan</Button></form>}
        {ticket.status === 'DALAM_PENGERJAAN' && <div className="space-y-4">
            <form onSubmit={(event) => { event.preventDefault(); note.post(route('technician.tickets.note', ticket.id), { onSuccess: () => { note.reset(); completion.setData('work_note', ''); toast.success('Pesan berhasil ditambahkan.'); }, onError: () => toast.error('Pesan gagal ditambahkan.') }); }}>
                <Textarea aria-label="Catatan pekerjaan" required rows={2} placeholder="Tambahkan progress..." value={note.data.body} onChange={(event) => { note.setData('body', event.target.value); completion.setData('work_note', event.target.value); }} />
                {note.hasErrors && <p className="mt-1 text-xs font-medium text-red-500">{note.errors.body}</p>}
                <Button variant="outline" size="sm" disabled={note.processing} className="mt-2 w-full">Simpan Catatan</Button>
            </form>
            <form className="border-t border-slate-200 pt-4" onSubmit={(event) => { event.preventDefault(); completion.post(route('technician.tickets.complete', ticket.id), { onSuccess: () => { completion.reset(); toast.success('Tiket ditandai selesai.'); }, onError: () => toast.error('Tiket gagal diselesaikan.') }); }}>
                <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectPhoto(event.dataTransfer.files[0] ?? null); }} className="relative flex w-full flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white py-5 text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                    {preview ? <img src={preview} alt="Preview penyelesaian" className="mb-2 h-16 w-16 rounded-md border border-slate-200 object-cover shadow-sm" /> : <div className="mb-2 text-slate-400"><CheckCircleIcon className="h-6 w-6" /></div>}
                    <span className="font-medium text-xs text-center px-4 text-slate-700">{completion.data.completion_photo ? completion.data.completion_photo.name : 'Pilih/Seret Bukti Penyelesaian'}</span>
                    <input aria-label="Pilih foto bukti penyelesaian" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" accept="image/jpeg,image/webp" onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)} />
                </div>
                {completion.hasErrors && <p className="mt-2 text-xs font-medium text-red-500 bg-red-50 p-2 rounded-md">{completion.errors.completion_photo}</p>}
                <Button disabled={completion.processing} className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700">{completion.processing ? 'Memproses...' : 'Selesaikan Tugas'}</Button>
            </form>
        </div>}
        </div>
        </div>}
    </Card>;
}

function Status({ status }: { status: string }) {
    const map: Record<string, string> = {
        MENUNGGU_DISPATCH: 'bg-amber-100 text-amber-900 border-amber-300',
        DITUGASKAN: 'bg-blue-100 text-blue-900 border-blue-300',
        DALAM_PENGERJAAN: 'bg-violet-100 text-violet-900 border-violet-300',
        SELESAI: 'bg-emerald-100 text-emerald-900 border-emerald-300',
         DIBATALKAN: 'bg-red-50 text-red-700 border-red-200'
    };
    const labels: Record<string, string> = { MENUNGGU_DISPATCH: 'Menunggu Dispatch', DITUGASKAN: 'Ditugaskan', DALAM_PENGERJAAN: 'Dalam Pengerjaan', SELESAI: 'Selesai', DIBATALKAN: 'Dibatalkan' };
    return <Badge variant="outline" className={`text-[10px] font-semibold ${map[status]}`}>{labels[status] ?? status}</Badge>;
}
