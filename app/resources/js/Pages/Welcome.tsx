import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const StarIcon = ({ className = 'h-4 w-4 fill-current' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className}><path d="m12 2.25 2.83 6.06 6.67.52-5.1 4.36 1.57 6.48L12 16.36 6.03 19.67l1.57-6.48-5.1-4.36 6.67-.52L12 2.25Z" /></svg>;
const ArrowRightIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export default function Welcome({ auth }: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const stats = [
        { value: '2,400+', label: 'Unit Terkelola' },
        { value: '98%', label: 'Tiket Terselesaikan' },
        { value: '<2 Jam', label: 'Respon Rata-rata' },
        { value: '12', label: 'Gedung Aktif' },
    ];

    const features = [
        { title: 'Pelaporan Instan', desc: 'Laporkan kerusakan unit dalam hitungan detik. Pilih kategori, tulis keluhan, kirim.' },
        { title: 'Dispatch Cepat', desc: 'Admin dapat mendelegasikan tugas ke teknisi yang tepat langsung dari dashboard.' },
        { title: 'Notifikasi Real-time', desc: 'Penghuni mendapat update status tiket langsung dari menunggu sampai selesai.' },
        { title: 'Riwayat Lengkap', desc: 'Semua tiket tercatat permanen beserta foto, teknisi, dan waktu penyelesaian.' },
        { title: 'Multi-role Access', desc: 'Satu platform untuk Penghuni, Admin, Teknisi, dan Platform Owner.' },
        { title: 'Dokumentasi Visual', desc: 'Upload foto kerusakan dan hasil perbaikan untuk bukti yang transparan.' },
    ];

    return (
        <>
            <Head title="FixIn" />
            <div className="min-h-screen bg-white font-sans overflow-x-hidden text-slate-900">
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center shadow-md shadow-violet-700/30">
                                <WrenchIcon className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-extrabold text-slate-900 text-lg tracking-tight">Fix<span className="text-violet-700">In</span></span>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="px-5 py-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-700/25">Dashboard</Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="px-4 py-2 text-sm font-semibold text-slate-900 hover:text-violet-700 transition-colors">Masuk</Link>
                                    <Link href={route('register')} className="px-5 py-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-700/25">Daftar Sekarang</Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                <section className="relative min-h-screen flex items-center pt-16 bg-slate-50 border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-700 mb-6">
                                <WrenchIcon className="h-3 w-3" /> Platform Operasional Gedung
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                                Lapor kerusakan.<br />Kirim teknisi.<br />Audit pekerjaan.
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-lg">
                                FixIn mengontrol siklus maintenance fasilitas dari laporan penghuni hingga selesai, tanpa grup chat yang berantakan.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="flex items-center justify-center gap-2 bg-violet-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-violet-800 transition-colors text-base">Buka Dashboard <ArrowRightIcon className="h-5 w-5" /></Link>
                                ) : (
                                    <>
                                        <Link href={route('register')} className="flex items-center justify-center gap-2 bg-violet-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-violet-800 transition-colors text-base">Daftar Gratis <ArrowRightIcon className="h-5 w-5" /></Link>
                                        <Link href={route('login')} className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-xl transition-colors text-base">Masuk</Link>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-slate-200">
                                <div className="text-sm">
                                    <p className="font-bold text-slate-900">&lt;2 Jam</p>
                                    <p className="text-slate-500">Rata-rata respon teknisi</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200" />
                                <div className="text-sm">
                                    <p className="font-bold text-slate-900">Foto & Waktu</p>
                                    <p className="text-slate-500">Tercatat permanen</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <div><p className="text-slate-900 font-bold text-sm">Alur Dispatch</p><p className="text-slate-500 text-xs mt-0.5">Visibilitas real-time</p></div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold"><StarIcon className="h-4 w-4" />Standar SLA</div>
                                </div>
                                <div className="space-y-4">
                                    {[{ id: 'TKT-031', role: 'Penghuni', act: 'Melaporkan AC bocor di Unit A-301', time: '10:00', color: 'bg-amber-100 text-amber-700' }, { id: 'TKT-031', role: 'Admin', act: 'Mendelegasikan ke Teknisi (Budi)', time: '10:15', color: 'bg-blue-100 text-blue-700' }, { id: 'TKT-031', role: 'Teknisi', act: 'Selesai. Foto bukti diunggah.', time: '11:45', color: 'bg-emerald-100 text-emerald-700' }].map((t, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-12 text-right pt-0.5"><span className="text-xs font-semibold text-slate-400">{t.time}</span></div>
                                            <div className="relative flex flex-col items-center">
                                                <div className={`w-2.5 h-2.5 rounded-full ${t.color.split(' ')[0]} border-2 border-white z-10`} />
                                                {i !== 2 && <div className="w-px h-full bg-slate-100 absolute top-2.5" />}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-semibold text-slate-900">{t.role}</p>
                                                <p className="text-sm text-slate-600 mt-0.5">{t.act}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-900 py-12 border-t border-slate-800">
                    <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {stats.map(({ value, label }) => <div key={label}><p className="text-4xl font-extrabold text-white mb-1">{value}</p><p className="text-slate-400 text-sm">{label}</p></div>)}
                    </div>
                </section>

                <section className="py-24 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-700 mb-4">Fitur Unggulan</div>
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Semua yang Anda butuhkan,<br />dalam satu platform</h2>
                            <p className="text-slate-500 text-lg max-w-xl mx-auto">Dirancang untuk memudahkan seluruh ekosistem pengelolaan gedung — dari laporan hingga penyelesaian.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map(({ title, desc }) => (
                                <div key={title} className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-violet-700 font-bold">{title.slice(0, 1)}</div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-white border-t border-slate-200">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">Siap merapikan<br />operasional gedung Anda?</h2>
                        <p className="text-slate-600 text-lg mb-10">Tinggalkan pencatatan manual. Beralih ke sistem tiket yang transparan untuk penghuni, admin, dan teknisi.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="flex items-center justify-center gap-2 bg-violet-700 text-white font-semibold px-10 py-4 rounded-xl hover:bg-violet-800 transition-colors text-base">Buka Dashboard <ArrowRightIcon className="h-5 w-5" /></Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="flex items-center justify-center gap-2 bg-violet-700 text-white font-semibold px-10 py-4 rounded-xl hover:bg-violet-800 transition-colors text-base">Daftar Sekarang <ArrowRightIcon className="h-5 w-5" /></Link>
                                    <Link href={route('login')} className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-xl transition-colors text-base">Masuk ke Akun</Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <footer className="bg-slate-950 py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-violet-700 rounded-lg flex items-center justify-center"><WrenchIcon className="h-3.5 w-3.5 text-white" /></div>
                                <span className="font-extrabold text-white text-base">Fix<span className="text-violet-400">In</span></span>
                            </div>
                            <p className="text-white/30 text-sm text-center">© 2026 FixIn — Universitas AMIKOM Yogyakarta. All rights reserved.</p>
                            <div className="flex gap-5 text-sm text-white/40"><span>Privasi</span><span>Syarat</span><span>Kontak</span></div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
