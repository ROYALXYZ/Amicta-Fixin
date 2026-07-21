import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

const FileTextIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const PlusIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const ZapIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WindIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DropletsIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 16.3c0 2.59 2.24 4.7 5 4.7s5-2.11 5-4.7c0-2.59-5-9.3-5-9.3s-5 6.71-5 9.3z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Building2Icon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16M10 21v-4a2 2 0 0 1 4 0v4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

function CategoryIcon({ name, className }: { name: string; className?: string }) {
    if (name.includes('Listrik')) return <ZapIcon className={className} />;
    if (name.includes('AC')) return <WindIcon className={className} />;
    if (name.includes('Air')) return <DropletsIcon className={className} />;
    return <Building2Icon className={className} />;
}

type Props = { tickets: any[]; buildings: any[]; categories: any[] };
type TicketPhotoPreview = { name: string; url: string } | null;
type Ticket = { id: number; status: string; description: string; created_at: string; building: { name: string }; unit: { number: string }; issue_category: { name: string }; status_histories: { new_status: string; note: string | null; created_at: string; changed_by: { name: string } }[] };

export default function Tickets({ tickets, buildings, categories }: Props) {
    const form = useForm({ building_id: '', unit_id: '', issue_category_id: '', description: '', damage_photo: null as File | null });
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const showError = (title: string, message: string) => setErrorModal({ title, message });

    const selectPhoto = (file: File | null) => {
        if (!file) return;
        if (!['image/jpeg', 'image/webp'].includes(file.type)) {
            showError('Format Foto Salah', 'Hanya file JPEG dan WebP yang diizinkan. Silakan pilih foto dengan format yang benar.');
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

    const preview: TicketPhotoPreview = form.data.damage_photo ? { name: form.data.damage_photo.name, url: URL.createObjectURL(form.data.damage_photo) } : null;

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Laporan Saya</h2>}><Head title="Laporan Saya" />
        <div className="mx-auto max-w-6xl p-6 lg:p-8 space-y-8">
            <div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Laporan Saya</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Buat laporan kerusakan dan pantau seluruh statusnya.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card id="buat-laporan" className="col-span-4">
                    <CardHeader>
                        <CardTitle>Lapor Kerusakan Baru</CardTitle>
                        <CardDescription>Lengkapi informasi agar teknisi dapat menangani masalah dengan tepat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={(event) => {
                            event.preventDefault();
                            form.post(route('resident.tickets.store'), {
                                onSuccess: () => form.reset(),
                                onError: (errors) => {
                                    const firstError = Object.values(errors)[0];
                                    if (firstError) showError('Pengiriman Gagal', firstError as string);
                                }
                            });
                        }}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Gedung / Area</Label>
                                    <Select value={form.data.building_id} onValueChange={(value) => { form.setData('building_id', value); form.setData('unit_id', ''); }}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Gedung / Area" /></SelectTrigger>
                                        <SelectContent>{buildings.map((building) => <SelectItem key={building.id} value={String(building.id)}>{building.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Select value={form.data.unit_id} onValueChange={(value) => form.setData('unit_id', value)} disabled={!form.data.building_id}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Unit" /></SelectTrigger>
                                        <SelectContent>{units.map((unit: any) => <SelectItem key={unit.id} value={String(unit.id)}>{unit.number}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Kategori Masalah</label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {categories.map((category) => (
                                        <Button type="button" variant={form.data.issue_category_id === String(category.id) ? 'default' : 'outline'} key={category.id} onClick={() => form.setData('issue_category_id', String(category.id))}
                                            className="h-20 flex-col gap-2">
                                            <CategoryIcon name={category.name} className="h-5 w-5" />
                                            {category.name}
                                        </Button>
                                    ))}
                                </div>
                                {form.errors.issue_category_id && <p className="text-[0.8rem] font-medium text-red-500">{form.errors.issue_category_id}</p>}
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

                <Card className="col-span-3 flex flex-col">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle>Riwayat Laporan</CardTitle>
                        <CardDescription>Laporan terbaru Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto max-h-[600px]">
                        <div className="divide-y divide-slate-100">
                            {tickets.map((ticket) => (
                                <button type="button" key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="w-full p-4 text-left transition-colors hover:bg-slate-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-slate-500">#{ticket.id}</span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs font-medium text-slate-600">{ticket.issue_category.name}</span>
                                        </div>
                                        <Status status={ticket.status} />
                                    </div>
                                    <p className="text-sm font-medium leading-none mb-1.5">{ticket.building.name} - Unit {ticket.unit.number}</p>
                                    <p className="text-sm text-slate-500 line-clamp-2">{ticket.description}</p>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </button>
                            ))}
                            {tickets.length === 0 && (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <FileTextIcon className="h-8 w-8 text-slate-300 mb-3" />
                                    <p className="text-sm font-medium text-slate-900">Belum ada riwayat laporan.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!errorModal} onOpenChange={(open) => !open && setErrorModal(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{errorModal?.title}</DialogTitle><DialogDescription>{errorModal?.message}</DialogDescription></DialogHeader>
                    <DialogFooter><Button type="button" onClick={() => setErrorModal(null)}>Mengerti</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent>
                    {selectedTicket && <><DialogHeader><DialogTitle>Detail Laporan #{selectedTicket.id}</DialogTitle><DialogDescription>{selectedTicket.issue_category.name} · {selectedTicket.building.name} · Unit {selectedTicket.unit.number}</DialogDescription></DialogHeader><p className="text-sm">{selectedTicket.description}</p><div className="space-y-3"><p className="text-sm font-medium">Status & pesan</p>{selectedTicket.status_histories.map((history, index) => <div key={`${history.created_at}-${index}`} className="rounded-md border p-3"><div className="flex items-center justify-between gap-3"><Status status={history.new_status} /><span className="text-xs text-muted-foreground">{new Date(history.created_at).toLocaleString('id-ID')}</span></div>{history.note && <p className="mt-2 text-sm">{history.note}</p>}<p className="mt-2 text-xs text-muted-foreground">Diperbarui oleh {history.changed_by.name}</p></div>)}</div></>}
                </DialogContent>
            </Dialog>
        </div>
    </AuthenticatedLayout>;
}

function Status({ status }: { status: string }) {
    const map: Record<string, string> = {
        MENUNGGU_DISPATCH: 'bg-amber-100 text-amber-700 border-amber-200',
        DITUGASKAN: 'bg-blue-100 text-blue-700 border-blue-200',
        DALAM_PENGERJAAN: 'bg-violet-100 text-violet-700 border-violet-200',
        SELESAI: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        DIBATALKAN: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return <Badge variant="outline" className={map[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
