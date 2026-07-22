import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    NavBody,
    Navbar,
    NavbarButton,
    NavbarLogo,
    NavItems,
} from '@/Components/ui/resizable-navbar';
import { useEffect, useRef, useState } from 'react';
import ShapeGrid from '@/Components/ShapeGrid';
import FeatureStack from '@/Components/FeatureStack';
import { Shield, Zap, Users, Star } from 'lucide-react';

const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const StarIcon = ({ className = 'h-4 w-4 fill-current' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className}><path d="m12 2.25 2.83 6.06 6.67.52-5.1 4.36 1.57 6.48L12 16.36 6.03 19.67l1.57-6.48-5.1-4.36 6.67-.52L12 2.25Z" /></svg>;
const ArrowRightIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;


export default function Welcome({ auth }: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navItems = [
        { name: 'Fitur', link: '#features' },
        { name: 'Tentang Kami', link: '#about' },
        { name: 'Kontak', link: '#contact' },
    ];
    const stats = [
        { value: '2,400+', label: 'Unit Terkelola' },
        { value: '98%', label: 'Tiket Terselesaikan' },
        { value: '<2 Jam', label: 'Respon Rata-rata' },
        { value: '12', label: 'Gedung Aktif' },
    ];

    return (
        <>
            <Head title="FixIn" />
            <div className="min-h-screen bg-white font-sans overflow-x-clip text-slate-900">
                <Navbar className="fixed top-0">
                    <NavBody className="!bg-transparent !shadow-none">
                        <NavbarLogo />
                        <NavItems items={navItems} />
                        <div className="flex items-center gap-3">
                            {auth.user ? <NavbarButton as={Link} href={route('dashboard')}>Dashboard</NavbarButton> : <>
                                <NavbarButton as={Link} href={route('login')} variant="secondary">Masuk</NavbarButton>
                                <NavbarButton as={Link} href={route('register')} variant="dark">Daftar</NavbarButton>
                            </>}
                        </div>
                    </NavBody>
                    <MobileNav className="!bg-transparent !shadow-none">
                        <MobileNavHeader>
                            <NavbarLogo />
                            <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                        </MobileNavHeader>
                        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                            {navItems.map((item) => <a key={item.link} href={item.link} onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-600"><span>{item.name}</span></a>)}
                            {auth.user ? <NavbarButton as={Link} href={route('dashboard')} onClick={() => setIsMobileMenuOpen(false)} className="w-full">Dashboard</NavbarButton> : <>
                                <NavbarButton as={Link} href={route('login')} onClick={() => setIsMobileMenuOpen(false)} variant="secondary" className="w-full">Masuk</NavbarButton>
                                <NavbarButton as={Link} href={route('register')} onClick={() => setIsMobileMenuOpen(false)} className="w-full">Daftar</NavbarButton>
                            </>}
                        </MobileNavMenu>
                    </MobileNav>
                </Navbar>

                <section className="relative min-h-screen flex items-center pt-16 bg-slate-50 border-b border-slate-200">
                    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                        <ShapeGrid
                            speed={0.25}
                            squareSize={48}
                            direction="diagonal"
                            borderColor="rgba(124, 58, 237, 0.18)"
                            hoverFillColor="rgba(124, 58, 237, 0.32)"
                            shape="square"
                            hoverTrailAmount={5}
                            className="opacity-55"
                        />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-12 grid lg:grid-cols-2 gap-12 items-center w-full">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 rounded-full px-3 py-1 text-[11px] font-semibold text-violet-700 mb-5">
                                <WrenchIcon className="h-3 w-3" /> Platform Operasional Gedung
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-5 tracking-tight">
                                Lapor kerusakan.<br />Kirim teknisi.<br />Audit pekerjaan.
                            </h1>
                            <p className="text-slate-600 text-base leading-relaxed mb-8 max-w-lg">
                                Tinggalkan tumpukan kertas dan grup obrolan yang berantakan. FixIn hadir sebagai platform terpadu yang menyinkronkan penghuni, manajemen, dan teknisi. Laporan kerusakan diselesaikan lebih cepat dengan pelacakan status yang transparan dan terukur.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={route('dashboard')} className="flex items-center justify-center gap-2 bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-violet-800 transition-colors text-sm">Lapor Sekarang <ArrowRightIcon className="h-4 w-4" /></Link>
                            </div>
                            <div className="flex items-center gap-4 mt-8 pt-6">
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900">&lt;2 Jam</p>
                                    <p className="text-slate-500">Rata-rata respon teknisi</p>
                                </div>
                                <div className="w-px h-6 bg-slate-200" />
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900">Foto & Waktu</p>
                                    <p className="text-slate-500">Tercatat permanen</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="bg-white/95 border border-slate-200 rounded-2xl p-5 shadow-xl shadow-slate-900/10">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                    <div><p className="text-slate-900 font-bold text-sm">Cara Kerja FixIn</p><p className="text-slate-500 text-[11px] mt-0.5">Visibilitas real-time</p></div>
                                </div>
                                <div className="space-y-3">
                                    {[{ id: 'TKT-031', role: 'Penghuni', act: 'Melaporkan AC bocor di Unit A-301', time: '10:00', color: 'bg-amber-100 text-amber-700' }, { id: 'TKT-031', role: 'Admin', act: 'Menugaskan ke Teknisi', time: '10:15', color: 'bg-blue-100 text-blue-700' }, { id: 'TKT-031', role: 'Teknisi', act: 'Selesai. Foto bukti diunggah.', time: '11:45', color: 'bg-emerald-100 text-emerald-700' }].map((t, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-10 text-right pt-0.5"><span className="text-[11px] font-semibold text-slate-400">{t.time}</span></div>
                                            <div className="relative flex flex-col items-center">
                                                <div className={`w-2 h-2 rounded-full ${t.color.split(' ')[0]} border border-white z-10 mt-1`} />
                                                {i !== 2 && <div className="w-px h-full bg-slate-100 absolute top-2" />}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <p className="text-xs font-semibold text-slate-900">{t.role}</p>
                                                <p className="text-xs text-slate-600 mt-0.5">{t.act}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div 
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 animate-bounce cursor-pointer z-20 hover:text-violet-700 transition-colors"
                        onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Scroll untuk tau lebih lanjut</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </div>
                </section>

                <section id="features">
                    <FeatureStack>
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-full px-3 py-1 text-[11px] font-semibold text-violet-700 mb-3">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Fitur Unggulan
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">Semua yang Anda butuhkan, dalam satu platform</h2>
                            <p className="text-slate-500 text-base max-w-xl mx-auto">Dirancang untuk memudahkan seluruh ekosistem pengelolaan gedung dari laporan hingga penyelesaian.</p>
                        </div>
                    </FeatureStack>
                </section>

                <AboutSection />

                <section id="contact" className="py-24 bg-white border-t border-slate-200">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">Siap merapikan<br />operasional gedung Anda?</h2>
                        <p className="text-slate-600 text-lg mb-10">Tinggalkan pencatatan manual. Beralih ke sistem tiket yang transparan untuk penghuni, admin, dan teknisi.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="flex items-center justify-center gap-2 bg-violet-700 text-white font-semibold px-10 py-4 rounded-xl hover:bg-violet-800 transition-colors text-base">Buka Dashboard <ArrowRightIcon className="h-5 w-5" /></Link>
                            ) : (
                                <>
                                    <a href="https://wa.me/62895365331035?text=Hallo%20kak%20kami%20ingin%20bergabung%20dengan%20FixIn!!" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-violet-700 text-white font-semibold px-10 py-4 rounded-xl hover:bg-violet-800 transition-colors text-base">Daftar Sekarang <ArrowRightIcon className="h-5 w-5" /></a>
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

function AboutSection() {
    return (
        <section id="about" className="py-24 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Lahir dari kebutuhan nyata penghuni gedung</h2>
                    <p className="text-slate-600 text-lg leading-relaxed mb-10">
                        FixIn lahir di lingkungan kampus Universitas AMIKOM Yogyakarta. Berangkat dari frustasi penghuni yang harus telepon berkali-kali hanya untuk melaporkan kerusakan kecil, kami membangun solusi digital yang menghubungkan semua pihak secara transparan.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 bg-violet-100 text-violet-700 flex items-center justify-center rounded-lg"><Shield strokeWidth={2.5} className="w-5 h-5" /></div>
                            <div><h4 className="font-bold text-slate-900 text-sm">Keamanan Data</h4><p className="text-slate-500 text-sm mt-1">Enkripsi End-to-end</p></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 bg-amber-100 text-amber-700 flex items-center justify-center rounded-lg"><Zap strokeWidth={2.5} className="w-5 h-5" /></div>
                            <div><h4 className="font-bold text-slate-900 text-sm">Performa Optimal</h4><p className="text-slate-500 text-sm mt-1">Kecepatan Respon Tinggi</p></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 bg-blue-100 text-blue-700 flex items-center justify-center rounded-lg"><Users strokeWidth={2.5} className="w-5 h-5" /></div>
                            <div><h4 className="font-bold text-slate-900 text-sm">Tim Berpengalaman</h4><p className="text-slate-500 text-sm mt-1">pengalaman lebih dari 2 tahun</p></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-lg"><Star strokeWidth={2.5} className="w-5 h-5" /></div>
                            <div><h4 className="font-bold text-slate-900 text-sm">Reputasi Kuat</h4><p className="text-slate-500 text-sm mt-1">Diadopsi banyak pengelola gedung</p></div>
                        </div>
                    </div>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]">
                    <img src="/images/developer_collaboration.jpg" alt="Tim Developer Berkolaborasi" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/10"></div>
                    
                    <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md p-3.5 px-5 rounded-xl shadow-xl border border-white/40">
                        <p className="text-2xl font-extrabold text-slate-900 mb-0.5 tracking-tight">500k+</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Download</p>
                    </div>
                    
                    <div className="absolute top-5 right-5 bg-amber-400/95 backdrop-blur-md p-3.5 px-5 rounded-xl shadow-xl border border-amber-300/50 text-right">
                        <p className="text-2xl font-extrabold text-slate-900 mb-0.5 tracking-tight">99.9%</p>
                        <p className="text-amber-900/70 text-[10px] font-bold uppercase tracking-widest">Waktu Respon</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
