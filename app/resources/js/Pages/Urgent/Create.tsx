import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ImagePlus, Send, Wrench } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

type Unit = { id: number; number: string };
type Building = { id: number; name: string; units: Unit[] };
type Props = { organization: { name: string }; buildings: Building[]; flash?: { success?: string } };

export default function Create({ organization, buildings, flash }: Props) {
    const form = useForm({ reporter_name: '', reporter_phone: '', building_id: '', unit_id: '', issue_category_name: '', description: '', damage_photo: null as File | null });
    const units = buildings.find((building) => String(building.id) === form.data.building_id)?.units ?? [];
    const submit: FormEventHandler = (event) => { event.preventDefault(); form.post(route('urgent.store'), { forceFormData: true, onSuccess: () => { form.reset(); toast.success('Laporan urgent berhasil dikirim.'); }, onError: () => toast.error('Laporan urgent gagal dikirim. Coba lagi.') }); };

    return <>
        <Head title={`Laporan Urgent - ${organization.name}`} />
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <Link href={route('login')} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Kembali ke login</Link>
                    <Link href="/" className="flex items-center gap-2 font-semibold text-foreground"><span className="flex size-8 items-center justify-center rounded-lg bg-slate-950 text-white"><Wrench className="size-4" /></span>FixIn</Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
                    <section className="pt-2">
                        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><AlertTriangle className="size-6" /></div>
                        <p className="mb-2 text-sm font-semibold text-rose-600">Laporan Urgent</p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Ada kerusakan yang perlu segera ditangani?</h1>
                        <p className="mt-4 max-w-md leading-7 text-muted-foreground">Kirim laporan fasilitas gedung secara langsung. Tidak perlu membuat akun atau menunggu proses verifikasi.</p>
                        <div className="mt-8 border-l-2 border-rose-200 pl-4 text-sm leading-6 text-muted-foreground"><strong className="font-semibold text-foreground">Khusus untuk fasilitas gedung.</strong><br />Contoh: listrik, AC, air, pintu, lift, atau kerusakan area bersama.</div>
                    </section>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-5"><CardTitle>Kirim laporan</CardTitle><CardDescription>{organization.name} · isi detail agar tim dapat merespons dengan tepat.</CardDescription></CardHeader>
                        <CardContent className="pt-6">
                            {flash?.success && <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{flash.success}</div>}
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid gap-5 sm:grid-cols-2"><Field label="Nama Anda" error={form.errors.reporter_name}><Input value={form.data.reporter_name} onChange={(event) => form.setData('reporter_name', event.target.value)} required /></Field><Field label="Nomor WhatsApp" error={form.errors.reporter_phone}><Input type="tel" placeholder="08xxxxxxxxxx" value={form.data.reporter_phone} onChange={(event) => form.setData('reporter_phone', event.target.value)} required /></Field></div>
                                <div className="grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2"><Field label="Gedung / Area" error={form.errors.building_id}><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus:ring-1 focus:ring-ring" value={form.data.building_id} onChange={(event) => { form.setData('building_id', event.target.value); form.setData('unit_id', ''); }} required><option value="">Pilih gedung</option>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></Field><Field label="Unit" error={form.errors.unit_id}><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus:ring-1 focus:ring-ring" value={form.data.unit_id} onChange={(event) => form.setData('unit_id', event.target.value)} required><option value="">Pilih unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.number}</option>)}</select></Field></div>
                                <Field label="Jenis kerusakan / fasilitas" error={form.errors.issue_category_name}><Input placeholder="Contoh: AC bocor, listrik mati, pintu rusak" value={form.data.issue_category_name} onChange={(event) => form.setData('issue_category_name', event.target.value)} required /></Field>
                                <Field label="Deskripsi masalah" error={form.errors.description}><textarea className="flex min-h-32 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring" placeholder="Jelaskan lokasi dan kondisi kerusakan..." value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} required /></Field>
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-4"><Label htmlFor="damage-photo" className="flex cursor-pointer items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-white text-muted-foreground shadow-sm"><ImagePlus className="size-4" /></span><span><span className="block text-sm font-medium text-foreground">Tambahkan foto <span className="font-normal text-muted-foreground">(opsional)</span></span><span className="block text-xs text-muted-foreground">JPG, JPEG, atau WebP · maksimal 2 MB</span></span></Label><input id="damage-photo" type="file" accept=".jpg,.jpeg,.webp,image/jpeg,image/webp" className="sr-only" onChange={(event) => form.setData('damage_photo', event.target.files?.[0] ?? null)} />{form.data.damage_photo && <p className="mt-3 text-xs text-muted-foreground">{form.data.damage_photo.name}</p>}{form.errors.damage_photo && <p className="mt-2 text-sm text-destructive">{form.errors.damage_photo}</p>}</div>
                                <Button type="submit" disabled={form.processing} className="w-full bg-rose-600 text-white hover:bg-rose-700"><Send className="mr-2 size-4" />{form.processing ? 'Mengirim laporan...' : 'Kirim Laporan Urgent'}</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-sm font-medium text-destructive">{error}</p>}</div>;
}
