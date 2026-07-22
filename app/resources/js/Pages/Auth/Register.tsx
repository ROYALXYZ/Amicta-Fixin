import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', username: '', phone_number: '', password: '', password_confirmation: '' });
    const submit: FormEventHandler = (event) => { event.preventDefault(); post(route('register'), { onFinish: () => reset('password', 'password_confirmation') }); };
    const error = (message?: string) => message && <p className="text-sm font-medium text-destructive">{message}</p>;

    return <><Head title="Daftar di FixIn" /><AuthSplitLayout eyebrow="Untuk seluruh penghuni dan tim gedung" title="Urusan gedung, lebih mudah bersama FixIn." description="Buat akun untuk melaporkan masalah, memantau progres perbaikan, dan tetap terhubung dengan tim gedung.">
        <div className="mb-7"><p className="text-sm font-semibold text-violet-700">Buat akun penghuni</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Mulai dengan FixIn</h2><p className="mt-3 text-sm leading-6 text-slate-600">Lengkapi data berikut untuk membuat akun di organisasi Anda.</p></div>
        <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2"><Label htmlFor="name">Nama lengkap</Label><Input id="name" autoComplete="name" placeholder="Nama Anda" value={data.name} onChange={(event) => setData('name', event.target.value)} aria-invalid={!!errors.name} required autoFocus />{error(errors.name)}</div>
            <div className="flex flex-col gap-2"><Label htmlFor="username">Username</Label><Input id="username" autoComplete="username" placeholder="Pilih username" value={data.username} onChange={(event) => setData('username', event.target.value)} aria-invalid={!!errors.username} required />{error(errors.username)}<p className="text-xs text-slate-500">Gunakan huruf, angka, tanda hubung, atau garis bawah.</p></div>
            <div className="flex flex-col gap-2"><Label htmlFor="phone_number">Nomor WhatsApp</Label><Input id="phone_number" type="tel" autoComplete="tel" placeholder="Contoh: 081234567890" value={data.phone_number} onChange={(event) => setData('phone_number', event.target.value)} aria-invalid={!!errors.phone_number} required />{error(errors.phone_number)}</div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" placeholder="Buat password" value={data.password} onChange={(event) => setData('password', event.target.value)} aria-invalid={!!errors.password} required />{error(errors.password)}</div><div className="flex flex-col gap-2"><Label htmlFor="password_confirmation">Konfirmasi password</Label><Input id="password_confirmation" type="password" autoComplete="new-password" placeholder="Ulangi password" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} aria-invalid={!!errors.password_confirmation} required />{error(errors.password_confirmation)}</div></div>
            <Button type="submit" size="lg" className="mt-2 w-full bg-violet-700 text-white shadow-sm shadow-violet-900/20 hover:bg-violet-800" disabled={processing}>{processing ? 'Membuat akun...' : <>Buat akun <ArrowRight data-icon="inline-end" /></>}</Button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-600">Sudah punya akun? <Link href={route('login')} className="font-semibold text-violet-700 hover:text-violet-800 hover:underline">Masuk</Link></p>
    </AuthSplitLayout></>;
}
