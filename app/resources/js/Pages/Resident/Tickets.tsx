import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { useOrganizationRealtime } from '@/hooks/useOrganizationRealtime';
import { toast } from 'sonner';

const FileTextIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ClockIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const CheckCircleIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const MapPinIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="10" r="3" /></svg>;
const PlusIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>;


type Props = { tickets: { data: any[]; current_page: number; last_page: number; per_page: number; total: number }; buildings: any[] };
type Option = [string | number, string];
type TicketPhotoPreview = { name: string; url: string } | null;

export default function Tickets({ tickets, buildings }: Props) {
    useOrganizationRealtime('tickets.changed', ['tickets']);
    const user = usePage().props.auth.user as { name: string; username?: string };
    const form = useForm({ building_id: '', unit_id: '', issue_category_name: '', description: '', damage_photo: null as File | null });
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
    const showError = (title: string, message: string) => setErrorModal({ title, message });

    const selectPhoto = (file: File | null) => {
        if (!file) return;
        if (!['image/jpeg', 'image/webp'].includes(file.type)) {
            showError('Format Foto Salah', 'Gunakan foto JPEG atau WebP. Foto HEIC/HEIF/PNG perlu dikonversi atau screenshot terlebih dahulu.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showError('Ukuran Foto Terlalu Besar', `Foto "${file.name}" berukuran ${(file.size / 1024 / 1024).toFixed(1)} MB. Maksimal 2 MB. Silakan kompres atau pilih foto lain.`);
            return;
        }
        form.clearErrors('damage_photo');
        form.setData('damage_photo', file);
    };

    const units = buildings.find((building) => String(building.id) === form.data.building_id)?.units ?? [];

    const counts = {
        total: tickets.total,
        waiting: tickets.data.filter((ticket) => ticket.status === 'MENUNGGU_DISPATCH').length,
        active: tickets.data.filter((ticket) => ['DITUGASKAN', 'DALAM_PENGERJAAN'].includes(ticket.status)).length,
        done: tickets.data.filter((ticket) => ticket.status === 'SELESAI').length
    };

    const preview: TicketPhotoPreview = form.data.damage_photo ? { name: form.data.damage_photo.name, url: URL.createObjectURL(form.data.damage_photo) } : null;

    const statCards = [
        { label: "Total Laporan", value: counts.total, icon: <FileTextIcon className="h-4 w-4 text-slate-500" /> },
        { label: "Menunggu", value: counts.waiting, icon: <ClockIcon className="h-4 w-4 text-slate-500" /> },
        { label: "Sedang Diproses", value: counts.active, icon: <WrenchIcon className="h-4 w-4 text-slate-500" /> },
        { label: "Selesai", value: counts.done, icon: <CheckCircleIcon className="h-4 w-4 text-slate-500" /> },
    ];

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Dashboard Penghuni</h2>}><Head title="Dashboard Penghuni" />
        <div className="mx-auto max-w-6xl p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Halo, {user.name.split(" ")[0]}</h2>
                    <p className="text-slate-500">Kelola dan pantau laporan kerusakan {user.username ? `Unit ${user.username}` : 'fasilitas'} Anda.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, icon }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            {icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <section id="buat-laporan">
                <Card>
                    <CardHeader>
                        <CardTitle>Lapor Kerusakan Baru</CardTitle>
                        <CardDescription>Lengkapi informasi agar teknisi dapat menangani masalah dengan tepat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={(event) => {
                            event.preventDefault();
                            form.post(route('resident.tickets.store'), {
                                onSuccess: () => { form.reset(); toast.success('Laporan berhasil dikirim.'); },
                                onError: (errors) => {
                                    toast.error('Laporan gagal dikirim. Periksa data lalu coba lagi.');
                                    const firstError = Object.values(errors)[0];
                                    if (firstError) showError('Pengiriman Gagal', firstError as string);
                                }
                            });
                        }}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Select label="Gedung / Area" value={form.data.building_id} onChange={(value: string) => { form.setData('building_id', value); form.setData('unit_id', ''); }} options={buildings.map((building): Option => [building.id, building.name])} />
                                <Select label="Unit" value={form.data.unit_id} onChange={(value: string) => form.setData('unit_id', value)} options={units.filter((unit: any) => unit.is_active).map((unit: any): Option => [unit.id, unit.number])} disabled={!form.data.building_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="issue-category">Jenis Masalah</Label>
                                <input id="issue-category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.data.issue_category_name} onChange={(event) => form.setData('issue_category_name', event.target.value)} placeholder="Contoh: Pipa bocor, lampu mati, atau kunci pintu rusak" maxLength={120} required />
                                {form.errors.issue_category_name && <p className="text-[0.8rem] font-medium text-red-500">{form.errors.issue_category_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Detail Kerusakan</label>
                                <textarea className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" placeholder="Ceritakan detail kerusakan yang Anda alami..." value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                                {form.errors.description && <p className="text-[0.8rem] font-medium text-red-500">{form.errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Foto Bukti (Wajib)</label>
                                <div className="flex items-center gap-4">
                                    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectPhoto(event.dataTransfer.files[0] ?? null); }} className="relative flex flex-1 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 py-6 text-sm hover:bg-slate-100 transition-colors cursor-pointer">
                                        <div className="flex flex-col items-center gap-1 text-slate-500">
                                            <PlusIcon className="h-5 w-5 mb-1" />
                                            <span className="font-medium text-slate-900">{form.data.damage_photo ? form.data.damage_photo.name : 'Pilih Foto'}</span>
                                            <span className="text-xs">Maksimal 2MB (JPEG/WebP)</span>
                                        </div>
                                        <input aria-label="Pilih foto kerusakan" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" accept="image/jpeg,image/webp" onChange={(event) => selectPhoto(event.target.files?.[0] ?? null)} />
                                    </div>
                                    {preview && <img src={preview.url} alt="Preview" className="h-24 w-24 rounded-md border border-slate-200 object-cover shadow-sm" />}
                                </div>
                                {form.errors.damage_photo && <p className="text-[0.8rem] font-medium text-red-500">{form.errors.damage_photo}</p>}
                            </div>

                            <div className="pt-2">
                                <Button disabled={form.processing} className="w-full">
                                    {form.processing ? 'Mengirim Laporan...' : 'Kirim Laporan Kerusakan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </section>

            <section aria-labelledby="riwayat-laporan">
                <div className="mb-4">
                    <h2 id="riwayat-laporan" className="text-xl font-semibold tracking-tight">Riwayat Laporan</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Pantau status dan detail laporan yang pernah Anda kirim.</p>
                </div>
                <Card className="flex flex-col">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle>Laporan Terbaru</CardTitle>
                        <CardDescription>Riwayat laporan Anda, dari yang paling baru.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto max-h-[600px]">
                        <div className="divide-y divide-slate-100">
                            {tickets.data.map((ticket) => (
                                <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-slate-500">#{ticket.id}</span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs font-medium text-slate-600">{ticket.custom_issue_category ?? ticket.issue_category.name}</span>
                                        </div>
                                        <Status status={ticket.status} />
                                    </div>
                                    <p className="text-sm font-medium leading-none mb-1.5">{ticket.building.name} - Unit {ticket.unit.number}</p>
                                     <p className="text-sm text-slate-500 line-clamp-2">{ticket.description}</p>
                                    {ticket.status === 'DIBATALKAN' && ticket.cancellation_reason && <p className="mt-2 rounded-md bg-slate-100 p-2 text-xs text-slate-700"><span className="font-semibold">Alasan pembatalan: </span>{ticket.cancellation_reason}</p>}
                                    <p className="text-xs text-slate-400 mt-2">
                                        {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                            {tickets.data.length === 0 && (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <FileTextIcon className="h-8 w-8 text-slate-300 mb-3" />
                                    <p className="text-sm font-medium text-slate-900">Belum ada riwayat laporan.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    {tickets.data.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm"><span className="text-muted-foreground">{tickets.total} laporan</span><div className="flex items-center gap-1.5"><span className="mr-1 text-xs text-muted-foreground">Tampilkan</span>{[5, 10, 15, 20].map((size) => <Link key={size} href={route('resident.tickets.index', { per_page: size })} className={`inline-flex size-8 items-center justify-center rounded-md border text-xs font-medium ${tickets.per_page === size ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>{size}</Link>)}{tickets.last_page > 1 && <><Button asChild variant="outline" size="icon" className="ml-1 size-8" disabled={tickets.current_page === 1}><Link aria-label="Halaman sebelumnya" href={route('resident.tickets.index', { page: tickets.current_page - 1, per_page: tickets.per_page })}>←</Link></Button><Button asChild variant="outline" size="icon" className="size-8" disabled={tickets.current_page === tickets.last_page}><Link aria-label="Halaman berikutnya" href={route('resident.tickets.index', { page: tickets.current_page + 1, per_page: tickets.per_page })}>→</Link></Button></>}</div></div>}
                </Card>
            </section>

            <Modal show={!!errorModal} maxWidth="md" onClose={() => setErrorModal(null)}>
                <div className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-black text-red-700">!</div>
                    <h2 className="text-lg font-bold text-slate-900">{errorModal?.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{errorModal?.message}</p>
                    <Button type="button" onClick={() => setErrorModal(null)} className="mt-6 w-full">Mengerti</Button>
                </div>
            </Modal>
        </div>
    </AuthenticatedLayout>;
}

function Select({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: Option[]; disabled?: boolean }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</label>
            <div className="relative">
                <select disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)}
                    className="w-full h-11 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-violet-400 disabled:opacity-50">
                    <option value="">Pilih {label}</option>
                    {options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">▼</div>
            </div>
        </div>
    );
}

function Status({ status }: { status: string }) {
    const map: Record<string, string> = {
        MENUNGGU_DISPATCH: 'bg-amber-100 text-amber-700 border-amber-200',
        DITUGASKAN: 'bg-blue-100 text-blue-700 border-blue-200',
        DALAM_PENGERJAAN: 'bg-violet-100 text-violet-700 border-violet-200',
        SELESAI: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        DIBATALKAN: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${map[status]}`}>{status.replaceAll('_', ' ')}</span>;
}
