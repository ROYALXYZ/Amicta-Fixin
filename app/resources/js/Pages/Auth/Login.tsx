import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const ArrowLeftIcon = ({ className = 'h-4 w-4', size }: { className?: string; size?: number }) => <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const EyeIcon = ({ className = 'h-4 w-4', size }: { className?: string; size?: number }) => <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="2.5" /></svg>;
const EyeOffIcon = ({ className = 'h-4 w-4', size }: { className?: string; size?: number }) => <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3l18 18" strokeLinecap="round" /><path d="M10.58 10.58A2.5 2.5 0 0 0 12 15a2.5 2.5 0 0 0 1.42-4.42" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.88 5.08A10.95 10.95 0 0 1 12 4.5C18 4.5 21.75 12 21.75 12a19.1 19.1 0 0 1-4.37 5.31" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.1 6.1C3.62 8.1 2.25 12 2.25 12s3.75 7.5 9.75 7.5c1.02 0 1.98-.14 2.86-.39" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WrenchIcon = ({ className = 'h-4 w-4', size }: { className?: string; size?: number }) => <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const LayoutDashboardIcon = ({ className = 'h-4 w-4', size }: { className?: string; size?: number }) => <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9 5h7v2h-7v-2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const UserIcon = ({ className = 'h-4 w-4', size }: { className?: string; size?: number }) => <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21a8 8 0 1 0-16 0" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="8" r="4" /></svg>;

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone_number: '',
        password: '',
        remember: false as boolean,
    });

    const [showPass, setShowPass] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Since Laravel routes logic based on subdomain, role switch here is purely cosmetic or for hint.
        // We submit same endpoint.
        post(route('login'), { onFinish: () => reset('password') });
    };


    return (
        <div className="min-h-screen bg-white font-sans flex text-slate-900">
            <Head title="Masuk" />

            {/* Left panel */}
            <div className="hidden lg:flex flex-1 bg-slate-950 flex-col justify-between p-16 relative overflow-hidden">
                <Link href="/" className="flex items-center gap-2.5 w-fit">
                    <div className="w-9 h-9 bg-violet-700 rounded-lg flex items-center justify-center">
                        <WrenchIcon size={16} className="text-white" />
                    </div>
                    <span className="font-extrabold text-white text-lg">Fix<span className="text-violet-300">In</span></span>
                </Link>
                <div>
                    <p className="text-violet-300 text-sm font-semibold mb-4">Akses operasional</p>
                    <h2 className="text-white text-4xl font-extrabold leading-tight mb-5">Masuk ke ruang kendali maintenance gedung.</h2>
                    <p className="text-slate-400 leading-relaxed max-w-md">Gunakan akun organisasi Anda untuk melihat tiket, assignment teknisi, dan riwayat bukti pekerjaan sesuai role.</p>
                </div>
                <div className="space-y-3">
                    {[["Penghuni", "buat laporan dan pantau status"], ["Admin", "atur dispatch dan prioritas"], ["Teknisi", "ambil tugas dan unggah bukti"]].map(([roleName, text]) => (
                        <div key={roleName} className="flex items-center gap-3 border border-slate-800 rounded-xl px-4 py-3">
                            <div className="w-2 h-2 rounded-full bg-violet-400" />
                            <p className="text-sm text-slate-300"><span className="font-semibold text-white">{roleName}</span> — {text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
                        <ArrowLeftIcon size={16} /> Kembali
                    </Link>
                    <p className="text-sm text-slate-500">
                        Belum punya akun? <Link href={route('register')} className="text-violet-700 font-semibold hover:underline">Daftar gratis</Link>
                    </p>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Masuk</h1>
                        <p className="text-slate-500 text-sm mb-7">Gunakan kredensial yang terdaftar untuk mengakses dashboard.</p>

                        <div className="flex items-center gap-2 text-slate-500 text-xs bg-slate-50 rounded-xl px-4 py-3 mb-6 border border-slate-200">
                            <UserIcon size={16} className="text-violet-700" />
                            <span>Role otomatis menyesuaikan kredensial Anda.</span>
                        </div>

                        {status && <div className="mb-4 text-sm font-medium text-emerald-600">{status}</div>}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                                    Nomor WhatsApp
                                </label>
                                <div className="flex gap-2">
                                    <div className="h-11 px-3 bg-slate-50 rounded-xl flex items-center text-sm text-slate-500 font-medium border border-slate-200 flex-shrink-0">+62</div>
                                    <input type="tel" placeholder="81xxxxxxxxx" required value={data.phone_number} onChange={e => setData('phone_number', e.target.value)}
                                        className="flex-1 h-11 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition" />
                                </div>
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone_number}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Password</label>
                                    {canResetPassword && <Link href={route('password.request')} className="text-xs text-violet-700 font-semibold hover:underline">Lupa password?</Link>}
                                </div>
                                <div className="relative">
                                    <input type={showPass ? "text" : "password"} placeholder="••••••••" required value={data.password} onChange={e => setData('password', e.target.value)}
                                        className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 px-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPass ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                            </div>

                            <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-violet-600 shadow-sm focus:ring-violet-500" checked={data.remember} onChange={e => setData('remember', e.target.checked)} />
                                <span className="ms-2 text-sm text-slate-600">Ingat saya</span>
                            </label>

                            <button disabled={processing} className="w-full h-11 mt-2 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-200 text-sm">
                                {processing ? 'Memproses...' : 'Masuk ke Dashboard'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
