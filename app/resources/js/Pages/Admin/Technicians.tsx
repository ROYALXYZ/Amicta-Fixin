import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Power, Trash2, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOrganizationRealtime } from '@/hooks/useOrganizationRealtime';
import { toast } from 'sonner';

type Technician = { id: number; name: string; username: string; phone_number: string; is_active: boolean; assigned_tickets_count: number; created_at: string };

export default function Technicians({ technicians }: { technicians: Technician[] }) {
    useOrganizationRealtime('technicians.changed', ['technicians']);
    const [rows, setRows] = useState(technicians);
    const [editing, setEditing] = useState<Technician | null>(null);
    const [adding, setAdding] = useState(false);
    const [toggling, setToggling] = useState<number | null>(null);
    const create = useForm({ name: '', username: '', phone_number: '', password: '' });
    const update = useForm({ name: '', username: '', password: '' });
    useEffect(() => setRows(technicians), [technicians]);
    const openEdit = (technician: Technician) => { setEditing(technician); update.setData({ name: technician.name, username: technician.username, password: '' }); };
    const toggle = async (technician: Technician) => {
        setToggling(technician.id);
        try {
            const response = await window.axios.patch(route('admin.technicians.toggle', technician.id), {}, { headers: { Accept: 'application/json' } });
            setRows((current) => current.map((row) => row.id === technician.id ? { ...row, is_active: response.data.is_active } : row));
            toast.success(`Teknisi ${technician.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
        } catch {
            toast.error('Status teknisi gagal diperbarui. Coba lagi.');
        } finally {
            setToggling(null);
        }
    };

    return <AuthenticatedLayout header={<h2 className="text-xl font-semibold tracking-tight">Manajemen Tukang</h2>}><Head title="Manajemen Tukang" />
        <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><h1 className="text-3xl font-bold tracking-tight">Manajemen Tukang</h1><p className="text-muted-foreground">Kelola akun, akses, dan kapasitas tukang.</p></div>
                <Button className="gap-2" onClick={() => { create.clearErrors(); setAdding(true); }}><Plus className="size-4" /> Tambah Tukang</Button>
            </div>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><UsersRound className="size-5" /> Daftar Tukang</CardTitle><CardDescription>{technicians.length} akun terdaftar.</CardDescription></CardHeader><CardContent>
                <Table><TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Username</TableHead><TableHead>WhatsApp</TableHead><TableHead>Tiket</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader><TableBody>
                    {rows.map((technician) => <TableRow key={technician.id}><TableCell className="font-medium">{technician.name}</TableCell><TableCell>{technician.username}</TableCell><TableCell>{technician.phone_number}</TableCell><TableCell>{technician.assigned_tickets_count}</TableCell><TableCell><Badge variant={technician.is_active ? 'default' : 'secondary'}>{technician.is_active ? 'Aktif' : 'Nonaktif'}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(technician)}><Pencil className="size-4" /><span className="sr-only">Ubah</span></Button><Button size="sm" variant="outline" disabled={toggling === technician.id} onClick={() => toggle(technician)}><Power className="size-4" /><span className="sr-only">{technician.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span></Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => { if (confirm(`Hapus akun ${technician.name}?`)) update.delete(route('admin.technicians.destroy', technician.id)); }}><Trash2 className="size-4" /><span className="sr-only">Hapus</span></Button></div></TableCell></TableRow>)}
                    {rows.length === 0 && <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">Belum ada tukang.</TableCell></TableRow>}
                </TableBody></Table>
            </CardContent></Card>
            <Dialog open={adding} onOpenChange={setAdding}><DialogContent><DialogHeader><DialogTitle>Tambah Tukang</DialogTitle><DialogDescription>Buat akun baru untuk menerima work order.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); create.post(route('admin.technicians.store'), { onSuccess: () => { create.reset(); setAdding(false); toast.success('Akun teknisi berhasil dibuat.'); }, onError: () => toast.error('Akun teknisi gagal dibuat.') }); }}><Field label="Nama" value={create.data.name} onChange={(value) => create.setData('name', value)} error={create.errors.name} /><Field label="Username" value={create.data.username} onChange={(value) => create.setData('username', value)} error={create.errors.username} /><Field label="WhatsApp" type="tel" value={create.data.phone_number} onChange={(value) => create.setData('phone_number', value)} error={create.errors.phone_number} /><Field label="Password sementara" type="password" value={create.data.password} onChange={(value) => create.setData('password', value)} error={create.errors.password} /><Button className="w-full" disabled={create.processing}>{create.processing ? 'Menyimpan...' : 'Simpan'}</Button></form></DialogContent></Dialog>
            <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>{editing && <DialogContent><DialogHeader><DialogTitle>Ubah Akun Tukang</DialogTitle><DialogDescription>Kosongkan password bila tidak ingin menggantinya.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); update.patch(route('admin.technicians.update', editing.id), { onSuccess: () => { update.reset(); setEditing(null); toast.success('Akun teknisi berhasil diperbarui.'); }, onError: () => toast.error('Akun teknisi gagal diperbarui.') }); }}><Field label="Nama" value={update.data.name} onChange={(value) => update.setData('name', value)} /><Field label="Username" value={update.data.username} onChange={(value) => update.setData('username', value)} /><Field label="Password baru" type="password" value={update.data.password} onChange={(value) => update.setData('password', value)} /><Button className="w-full" disabled={update.processing}>Simpan Perubahan</Button></form></DialogContent>}</Dialog>
        </div>
    </AuthenticatedLayout>;
}

function Field({ label, value, onChange, error, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; error?: string; type?: string }) { return <div className="space-y-2"><Label>{label}</Label><Input required={type !== 'password' || label.includes('sementara')} minLength={type === 'password' ? 8 : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={!!error} />{error && <p className="text-sm font-medium text-destructive">{error}</p>}</div>; }
