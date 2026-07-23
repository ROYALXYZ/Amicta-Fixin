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
import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ShapeGrid from '@/Components/ShapeGrid';
import FeatureGrid from '@/Components/FeatureGrid';
import { Marquee } from '@/Components/ui/marquee';
import { GridPattern } from '@/Components/ui/grid-pattern';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Shield, Zap, Users, Star, AlertTriangle } from 'lucide-react';

const WrenchIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M22 19.59 14.41 12A6.5 6.5 0 0 0 8 4.5L11 7.5 7.5 11 4.5 8A6.5 6.5 0 0 0 12 14.41L19.59 22 22 19.59Z" /></svg>;
const StarIcon = ({ className = 'h-4 w-4 fill-current' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className}><path d="m12 2.25 2.83 6.06 6.67.52-5.1 4.36 1.57 6.48L12 16.36 6.03 19.67l1.57-6.48-5.1-4.36 6.67-.52L12 2.25Z" /></svg>;
const ArrowRightIcon = ({ className = 'h-4 w-4' }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4.5 12h15m0 0-6.75-6.75M19.5 12l-6.75 6.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const testimonials = [
    { name: 'Rangga', role: 'Penghuni', body: 'Lapor kerusakan jadi jauh lebih cepat. Tidak perlu lagi mencari kontak teknisi.' },
    { name: 'Dina', role: 'Admin Gedung', body: 'Status setiap laporan terlihat jelas, jadi koordinasi tim lebih rapi.' },
    { name: 'Fajar', role: 'Teknisi', body: 'Detail unit dan foto kerusakan membantu saya datang dengan persiapan yang tepat.' },
    { name: 'Nadia', role: 'Penghuni', body: 'Saya bisa memantau laporan sampai selesai tanpa harus bertanya berulang kali.' },
    { name: 'Arif', role: 'Manajemen', body: 'Riwayat pekerjaan tersimpan rapi dan mudah ditinjau saat evaluasi.' },
    { name: 'Sinta', role: 'Admin Gedung', body: 'Semua pihak mendapat informasi yang sama. Tidak ada lagi laporan yang tercecer.' },
    { name: 'Bagas', role: 'Teknisi', body: 'Detail laporan yang lengkap membuat pekerjaan di lapangan lebih terarah.' },
    { name: 'Maya', role: 'Penghuni', body: 'Notifikasi status membuat saya tahu kapan laporan mulai ditangani.' },
    { name: 'Rizky', role: 'Manajemen', body: 'Rekap pekerjaan membantu kami melihat prioritas perbaikan setiap minggu.' },
];

function TestimonialCard({ name, role, body }: (typeof testimonials)[number]) {
    return <figure className="relative z-10 w-72 shrink-0 rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-sm backdrop-blur-[2px] transition-shadow hover:shadow-md">
        <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">{name[0]}</div>
            <div><figcaption className="text-sm font-semibold text-slate-900">{name}</figcaption><p className="text-xs text-slate-500">{role}</p></div>
        </div>
        <blockquote className="text-sm leading-relaxed text-slate-600">“{body}”</blockquote>
    </figure>;
}


export default function Welcome({ auth }: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navItems = [
        { name: 'Fitur', link: '#features' },
        { name: 'Tentang Kami', link: '#about' },
        { name: 'Testimonial', link: '#testimonials' },
        { name: 'Kontak', link: '#contact' },
    ];
    const stats = [
        { value: '2,400+', label: 'Unit Terkelola' },
        { value: '98%', label: 'Tiket Terselesaikan' },
        { value: '<2 Jam', label: 'Respon Rata-rata' },
        { value: '12', label: 'Gedung Aktif' },
    ];

    useEffect(() => {
        AOS.init({ duration: 650, easing: 'ease-out-cubic', once: true, offset: 80, disable: 'mobile' });
    }, []);

    return (
        <>
            <Head title="FixIn" />
            <div className="min-h-screen scroll-smooth bg-white font-sans overflow-x-clip text-slate-900">
                <Navbar className="fixed top-0 z-50 w-full">
                    <NavBody className="!bg-[#F8F9FA] border-b border-slate-100">
                        <NavbarLogo />
                        <NavItems items={navItems} />
                        <div className="flex items-center gap-3">
                            {auth.user ? <NavbarButton as={Link} href={route('dashboard')}>Dashboard</NavbarButton> : <>
                                <NavbarButton as={Link} href={route('urgent.create')} variant="dark" className="!bg-red-600 hover:!bg-red-700 !border-none !text-white flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Emergency</NavbarButton>
                            </>}
                        </div>
                    </NavBody>
                    <MobileNav className="!bg-[#F8F9FA] border-b border-slate-100">
                        <MobileNavHeader>
                            <NavbarLogo />
                            <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                        </MobileNavHeader>
                        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                            {navItems.map((item) => <a key={item.link} href={item.link} onClick={(event) => { const target = document.getElementById(item.link.slice(1)); if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.history.pushState(null, '', item.link); } setIsMobileMenuOpen(false); }} className="text-neutral-600"><span>{item.name}</span></a>)}
                            {auth.user ? <NavbarButton as={Link} href={route('dashboard')} onClick={() => setIsMobileMenuOpen(false)} className="w-full">Dashboard</NavbarButton> : <>
                                <NavbarButton as={Link} href={route('urgent.create')} onClick={() => setIsMobileMenuOpen(false)} variant="dark" className="w-full !bg-red-600 hover:!bg-red-700 !border-none !text-white flex items-center justify-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Emergency</NavbarButton>
                            </>}
                        </MobileNavMenu>
                    </MobileNav>
                </Navbar>

                <section className="relative isolate min-h-screen flex items-center pt-16 bg-[#FAFAFC] border-b border-slate-100">
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
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
                    <div className="relative z-20 max-w-7xl mx-auto px-6 py-16 lg:py-12 grid lg:grid-cols-2 gap-12 items-center w-full">
                         <div className="relative">
                            <div className="absolute -z-10 -top-20 -left-20 w-72 h-72 rounded-full bg-primary/30 blur-[100px] opacity-60 mix-blend-multiply" />
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
                                <Link href={route('dashboard')} className="flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-1 text-sm">Lapor Sekarang <ArrowRightIcon className="h-4 w-4" /></Link>
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
                            <div className="relative bg-white/95 border border-primary/10 rounded-2xl p-5 shadow-[0_10px_40px_rgba(139,92,246,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_15px_50px_rgba(139,92,246,0.12)]">
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
                    
                </section>

                <section className="bg-violet-800 py-16 md:py-20" aria-label="Statistik FixIn">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {stats.map((stat) => (
                             <div key={stat.label} data-aos="fade-up">
                                <p className="text-5xl font-extrabold tracking-tight text-white">{stat.value}</p>
                                <h2 className="mt-3 text-base font-bold text-white">{stat.label}</h2>
                                <p className="mt-2 text-sm leading-relaxed text-white/90">
                                    Data operasional tercatat rapi dan mudah dipantau.
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="features" className="scroll-mt-20">
                    <FeatureGrid>
                         <div data-aos="fade-up" className="text-center mb-6">
                            <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-full px-3 py-1 text-[11px] font-semibold text-violet-700 mb-3">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Fitur Unggulan
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">Semua yang Anda butuhkan, dalam satu platform</h2>
                            <p className="text-slate-500 text-base max-w-xl mx-auto">Dirancang untuk memudahkan seluruh ekosistem pengelolaan gedung dari laporan hingga penyelesaian.</p>
                        </div>
                    </FeatureGrid>
                </section>

                 <AboutSection />

                 <section id="testimonials" className="relative flex min-h-screen scroll-mt-20 items-center overflow-hidden bg-[#FAFAFC] py-24" aria-labelledby="testimonials-title">
                     <GridPattern
                         squares={[[4, 4], [5, 1], [8, 2], [5, 3], [5, 5], [10, 10], [12, 15], [15, 10], [10, 15]]}
                         className="inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-violet-300/20 stroke-violet-300/20 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
                     />
                     <div className="relative z-10 w-full">
                         <div className="mx-auto mb-10 max-w-2xl px-6 text-center">
                            <div className="mb-3 inline-flex rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">Cerita Pengguna</div>
                            <h2 id="testimonials-title" className="mb-3 text-3xl font-extrabold text-slate-900">Dipakai oleh tim yang ingin bekerja lebih rapi</h2>
                            <p className="text-base text-slate-500">Pengalaman singkat dari penghuni, admin, dan teknisi yang menggunakan FixIn.</p>
                        </div>
                        <div className="relative mx-auto max-w-7xl">
                            <Marquee pauseOnHover className="[--duration:36s]">
                                 {testimonials.slice(0, Math.ceil(testimonials.length / 2)).map((testimonial) => <TestimonialCard key={testimonial.name} {...testimonial} />)}
                            </Marquee>
                            <Marquee reverse pauseOnHover className="[--duration:40s]">
                                 {testimonials.slice(Math.ceil(testimonials.length / 2)).map((testimonial) => <TestimonialCard key={testimonial.name} {...testimonial} />)}
                            </Marquee>
                             <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FAFAFC] to-transparent sm:w-32" />
                             <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FAFAFC] to-transparent sm:w-32" />
                        </div>
                    </div>
                </section>

                <footer id="contact" className="scroll-mt-20 mx-2 mb-2 overflow-hidden rounded-[1.5rem] bg-violet-800 text-white sm:mx-3 sm:mb-3">
                    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
                         <div data-aos="fade-up" className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Siap merapikan operasional gedung Anda?</h2>
                            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-violet-100 sm:text-lg">Tinggalkan pencatatan manual. Beralih ke sistem tiket yang transparan untuk penghuni, admin, dan teknisi.</p>
                            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                                {auth.user ? (
                                    <Button asChild size="lg" className="bg-white text-violet-800 hover:bg-violet-50"><Link href={route('dashboard')}>Buka Dashboard <ArrowRightIcon /></Link></Button>
                                ) : (
                                    <>
                                        <Button asChild size="lg" className="bg-white text-violet-800 hover:bg-violet-50"><a href="https://wa.me/62895365331035?text=Hallo%20kak%20kami%20ingin%20bergabung%20dengan%20FixIn!!" target="_blank" rel="noopener noreferrer">Daftar Sekarang <ArrowRightIcon /></a></Button>
                                        <Button asChild size="lg" variant="outline" className="border-0 bg-violet-700 text-white shadow-lg shadow-violet-950/25 hover:bg-violet-800 hover:text-white hover:shadow-xl hover:shadow-violet-950/35"><Link href={route('login')}>Masuk ke Akun</Link></Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <Separator className="my-16 bg-violet-400/40" />

                        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-white text-violet-800"><WrenchIcon className="size-4" /></div>
                                    <span className="text-lg font-extrabold">Fix<span className="text-violet-200">In</span></span>
                                </div>
                                <p className="mt-5 text-sm leading-relaxed text-violet-100">Platform operasional terpadu untuk menjaga laporan, pekerjaan, dan bukti perbaikan tetap sinkron.</p>
                                <nav className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-violet-100" aria-label="Navigasi footer">
                                    <a href="#features" className="transition-colors hover:text-white">Fitur</a><a href="#about" className="transition-colors hover:text-white">Tentang Kami</a><a href="#contact" className="transition-colors hover:text-white">Kontak</a>
                                </nav>
                            </div>
                            <p className="text-sm text-violet-200">© 2026 FixIn — Universitas AMIKOM Yogyakarta.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function AboutSection() {
    return (
         <section id="about" className="flex min-h-screen scroll-mt-20 items-center bg-violet-800 py-24">
             <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                 <div data-aos="fade-right">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">Lahir dari kebutuhan nyata penghuni gedung</h2>
                    <p className="text-white/90 text-lg leading-relaxed mb-10">
                        FixIn lahir di lingkungan kampus Universitas AMIKOM Yogyakarta. Berangkat dari frustasi penghuni yang harus telepon berkali-kali hanya untuk melaporkan kerusakan kecil, kami membangun solusi digital yang menghubungkan semua pihak secara transparan.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <div className="shrink-0 text-white"><Shield strokeWidth={2.5} className="w-6 h-6" /></div>
                            <div><h4 className="font-bold text-white text-sm">Keamanan Data</h4><p className="text-violet-200 text-sm mt-1">Enkripsi End-to-end</p></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 text-white"><Zap strokeWidth={2.5} className="w-6 h-6" /></div>
                            <div><h4 className="font-bold text-white text-sm">Performa Optimal</h4><p className="text-violet-200 text-sm mt-1">Kecepatan Respon Tinggi</p></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 text-white"><Users strokeWidth={2.5} className="w-6 h-6" /></div>
                            <div><h4 className="font-bold text-white text-sm">Tim Berpengalaman</h4><p className="text-violet-200 text-sm mt-1">pengalaman lebih dari 2 tahun</p></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 text-white"><Star strokeWidth={2.5} className="w-6 h-6" /></div>
                            <div><h4 className="font-bold text-white text-sm">Reputasi Kuat</h4><p className="text-violet-200 text-sm mt-1">Diadopsi banyak pengelola gedung</p></div>
                        </div>
                    </div>
                </div>
                
                 <div data-aos="fade-left" data-aos-delay="150" className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]">
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
