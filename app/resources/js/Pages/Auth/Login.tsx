import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({ login: '', password: '', remember: false });
    const [showPassword, setShowPassword] = useState(false);
    const submit: FormEventHandler = (event) => { event.preventDefault(); post(route('login'), { onFinish: () => reset('password') }); };

    return <><Head title="Masuk ke FixIn" /><AuthSplitLayout eyebrow="Untuk seluruh penghuni dan tim gedung" title="Urusan gedung, lebih mudah bersama FixIn." description="Laporkan masalah, pantau progres, dan tetap terhubung dengan tim gedung dalam satu platform.">
        <div className="mb-8"><p className="text-sm font-semibold text-violet-700">Selamat datang kembali</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Masuk ke akun Anda</h2><p className="mt-3 text-sm leading-6 text-slate-600">Gunakan username atau nomor WhatsApp yang terdaftar.</p></div>
        {status && <p className="mb-5 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{status}</p>}
        <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2"><Label htmlFor="login">Username atau nomor WhatsApp</Label><Input id="login" type="text" autoComplete="username" placeholder="Contoh: admin-gedung atau 081234567890" value={data.login} onChange={(event) => setData('login', event.target.value)} aria-invalid={!!errors.login} required autoFocus />{errors.login && <p className="text-sm font-medium text-destructive">{errors.login}</p>}</div>
            <div className="flex flex-col gap-2"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label>{canResetPassword && <Link href={route('password.request')} className="text-sm font-medium text-violet-700 hover:text-violet-800 hover:underline">Lupa password?</Link>}</div><div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan password" value={data.password} onChange={(event) => setData('password', event.target.value)} className="pr-11" aria-invalid={!!errors.password} required /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 text-slate-500 hover:text-violet-700" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff /> : <Eye />}</Button></div>{errors.password && <p className="text-sm font-medium text-destructive">{errors.password}</p>}</div>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className="size-4 rounded border-input accent-violet-700" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} />Ingat saya</label>
            <Button type="submit" size="lg" className="mt-1 w-full bg-violet-700 text-white shadow-sm shadow-violet-900/20 hover:bg-violet-800" disabled={processing}>{processing ? 'Memproses...' : <>Masuk <ArrowRight data-icon="inline-end" /></>}</Button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-600">Belum punya akun? <Link href={route('register')} className="font-semibold text-violet-700 hover:text-violet-800 hover:underline">Daftar sekarang</Link></p>
    </AuthSplitLayout></>;
}
