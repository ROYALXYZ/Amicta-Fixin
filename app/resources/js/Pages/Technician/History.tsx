import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

type Ticket = {
    id: number; status: string; priority: string; is_urgent: boolean;
    issue_category: { name: string }; building: { name: string }; unit: { number: string };
    description: string; submitted_at: string | null; started_at: string | null; completed_at: string | null;
    photo_urls?: { type: string; url: string; created_at?: string | null }[]; work_notes?: { body: string; created_at?: string | null }[];
};

const fmt = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const statusLabels: Record<string, string> = { SELESAI: 'Selesai', DIBATALKAN: 'Dibatalkan' };

export default function History({ tickets }: { tickets: Ticket[] }) {
    const [query, setQuery] = useState('');
    const [urgency, setUrgency] = useState('ALL');
    const [time, setTime] = useState('ALL');
    const filtered = tickets.filter((ticket) => {
        const haystack = `${ticket.id} ${ticket.issue_category.name} ${ticket.building.name} ${ticket.unit.number} ${ticket.description}`.toLowerCase();
        const age = ticket.submitted_at ? Date.now() - new Date(ticket.submitted_at).getTime() : Infinity;
        const submitted = ticket.submitted_at ? new Date(ticket.submitted_at).getTime() : 0;
        const today = new Date().setHours(0, 0, 0, 0);
        const matchesUrgency = urgency === 'ALL' || (urgency === 'URGENT' ? ticket.is_urgent : !ticket.is_urgent);
        const matchesTime = time === 'ALL' || (time === 'TODAY' ? submitted >= today : time === 'WEEK' ? age <= 7 * 86_400_000 : age <= 30 * 86_400_000);
        return (query.trim() === '' || haystack.includes(query.toLowerCase())) && matchesUrgency && matchesTime;
    });

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Riwayat Pengerjaan</h2>}><Head title="Riwayat Pengerjaan" />
        <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
            <div><h1 className="text-3xl font-bold tracking-tight">Riwayat Pengerjaan</h1><p className="text-slate-500">Tinjau tiket yang sudah selesai atau dibatalkan.</p></div>
            <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Select value={urgency} onValueChange={setUrgency}><SelectTrigger className="w-[150px]" aria-label="Filter urgensi"><SelectValue placeholder="Semua Urgensi" /></SelectTrigger><SelectContent><SelectItem value="ALL">Semua Urgensi</SelectItem><SelectItem value="URGENT">Urgent</SelectItem><SelectItem value="REGULAR">Reguler</SelectItem></SelectContent></Select>
                <Select value={time} onValueChange={setTime}><SelectTrigger className="w-[155px]" aria-label="Filter waktu masuk"><SelectValue placeholder="Semua Waktu" /></SelectTrigger><SelectContent><SelectItem value="ALL">Semua Waktu</SelectItem><SelectItem value="TODAY">Masuk Hari Ini</SelectItem><SelectItem value="WEEK">7 Hari Terakhir</SelectItem><SelectItem value="MONTH">30 Hari Terakhir</SelectItem></SelectContent></Select>
                <Input className="sm:ml-auto sm:w-72" placeholder="Cari gedung, unit, ID..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </Card>
            {filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((ticket) => <HistoryCard key={ticket.id} ticket={ticket} />)}</div> : <Card className="py-16 text-center"><CardContent><p className="font-semibold text-slate-900">Tidak ada riwayat yang cocok</p><p className="mt-1 text-sm text-slate-500">Coba ubah filter atau kata pencarian.</p></CardContent></Card>}
        </div>
    </AuthenticatedLayout>;
}

function HistoryCard({ ticket }: { ticket: Ticket }) {
    const completionPhotos = (ticket.photo_urls ?? []).filter((photo) => photo.type === 'PENYELESAIAN');
    return <Card className="opacity-90"><CardHeader className="flex flex-row items-start justify-between gap-3"><div><CardTitle className="text-lg">Unit {ticket.unit.number}</CardTitle><CardDescription>{ticket.building.name} · #{ticket.id}</CardDescription></div><Badge variant="outline" className={ticket.status === 'SELESAI' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}>{statusLabels[ticket.status]}</Badge></CardHeader><CardContent><p className="text-sm font-medium text-slate-900">{ticket.issue_category.name}</p><p className="mt-2 line-clamp-3 text-sm text-slate-600">{ticket.description}</p><dl className="mt-4 space-y-1 text-xs text-slate-500"><div className="flex justify-between gap-4"><dt>Masuk</dt><dd className="text-right">{fmt(ticket.submitted_at)}</dd></div>{ticket.started_at && <div className="flex justify-between gap-4"><dt>Mulai</dt><dd className="text-right">{fmt(ticket.started_at)}</dd></div>}{ticket.completed_at && <div className="flex justify-between gap-4 font-semibold text-emerald-600"><dt>Selesai</dt><dd className="text-right">{fmt(ticket.completed_at)}</dd></div>}</dl>{(ticket.work_notes ?? []).length > 0 && <div className="mt-4 space-y-2 border-t pt-4">{ticket.work_notes!.map((note, index) => <div key={index} className="rounded-md bg-slate-50 p-2 text-xs text-slate-600"><p>{note.body}</p><p className="mt-1 text-[11px] text-slate-400">{fmt(note.created_at)}</p></div>)}</div>}{completionPhotos.length > 0 && <div className="mt-4 flex gap-2">{completionPhotos.map((photo) => <a key={photo.url} href={photo.url} target="_blank" rel="noreferrer"><img src={photo.url} alt="Bukti penyelesaian" className="size-14 rounded-md border object-cover" /><span className="mt-1 block text-[10px] text-slate-400">{fmt(photo.created_at)}</span></a>)}</div>}</CardContent></Card>;
}
