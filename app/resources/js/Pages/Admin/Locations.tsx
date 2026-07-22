import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

type Building = { id: number; name: string; is_active: boolean; units: { id: number; number: string; is_active: boolean }[] };

export default function Locations({ buildings }: { buildings: Building[] }) {
    const buildingForm = useForm({ name: '' });
    const unitForm = useForm({ building_id: '', number: '' });

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Gedung & Unit</h2>}>
        <Head title="Gedung & Unit" />
        <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
            <div><h1 className="text-2xl font-bold tracking-tight">Gedung, Area, dan Unit</h1><p className="mt-1 text-sm text-muted-foreground">Buat struktur lokasi yang akan dipilih penghuni saat melapor.</p></div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card><CardHeader><CardTitle>Tambah Gedung / Area</CardTitle><CardDescription>Contoh: Gedung A, Laboratorium, Tower Selatan.</CardDescription></CardHeader><CardContent><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); buildingForm.post(route('admin.buildings.store'), { onSuccess: () => buildingForm.reset() }); }}><Label htmlFor="building-name">Nama</Label><Input id="building-name" value={buildingForm.data.name} onChange={(event) => buildingForm.setData('name', event.target.value)} required maxLength={120} /><p className="text-sm text-destructive">{buildingForm.errors.name}</p><Button disabled={buildingForm.processing}>Tambah Gedung / Area</Button></form></CardContent></Card>
                <Card><CardHeader><CardTitle>Tambah Unit</CardTitle><CardDescription>Pilih gedung/area lalu masukkan nomor atau nama ruang.</CardDescription></CardHeader><CardContent><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); unitForm.post(route('admin.units.store'), { onSuccess: () => unitForm.reset('number') }); }}><Label htmlFor="unit-building">Gedung / Area</Label><select id="unit-building" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={unitForm.data.building_id} onChange={(event) => unitForm.setData('building_id', event.target.value)} required><option value="">Pilih gedung / area</option>{buildings.filter((building) => building.is_active).map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select><Label htmlFor="unit-number">Nomor / Nama Unit</Label><Input id="unit-number" value={unitForm.data.number} onChange={(event) => unitForm.setData('number', event.target.value)} placeholder="Contoh: A-301 atau Lab Komputer 1" required maxLength={50} /><p className="text-sm text-destructive">{unitForm.errors.number || unitForm.errors.building_id}</p><Button disabled={unitForm.processing}>Tambah Unit</Button></form></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Struktur Lokasi</CardTitle><CardDescription>{buildings.length ? 'Unit tersedia untuk laporan penghuni.' : 'Belum ada gedung atau area.'}</CardDescription></CardHeader><CardContent className="space-y-4">{buildings.map((building) => <section key={building.id} className="rounded-lg border p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{building.name}</h2><span className="text-xs text-muted-foreground">{building.units.length} unit</span></div>{building.units.length ? <div className="mt-3 flex flex-wrap gap-2">{building.units.map((unit) => <span key={unit.id} className="rounded-md bg-muted px-2.5 py-1 text-sm">{unit.number}</span>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Belum ada unit.</p>}</section>)}</CardContent></Card>
        </div>
    </AuthenticatedLayout>;
}
