import { useEffect, useRef, useState, type ReactNode } from 'react';

type Feature = { eyebrow: string; title: string; description: string; className: string };

const features: Feature[] = [
    { eyebrow: '01 / Laporan', title: 'Pelaporan Instan', description: 'Resident melaporkan kerusakan beserta foto dan detail unit dalam hitungan detik.', className: 'bg-white text-slate-900 border-violet-100' },
    { eyebrow: '02 / Transparansi', title: 'Riwayat Lengkap', description: 'Semua tiket, status, teknisi, foto, dan waktu tersimpan dalam satu riwayat.', className: 'bg-violet-700 text-white border-violet-700' },
    { eyebrow: '03 / Realtime', title: 'Notifikasi Real-time', description: 'Resident mendapat pembaruan status tiket tanpa perlu mengejar admin lewat chat.', className: 'bg-slate-900 text-white border-slate-900' },
    { eyebrow: '04 / Bukti', title: 'Audit Pekerjaan', description: 'Catatan teknisi, foto hasil perbaikan, dan waktu penyelesaian membuat pekerjaan terukur.', className: 'bg-white text-slate-900 border-violet-100' },
];

export default function FeatureStack({ children }: { children?: ReactNode }) {
    const sectionRef = useRef<HTMLElement>(null);
    const [progress, setProgress] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionQuery.matches) {
            setReducedMotion(true);
            setProgress(1);
            return;
        }
        let frame = 0;
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = section.getBoundingClientRect();
                const range = Math.max(section.offsetHeight - window.innerHeight, 1);
            setProgress(Math.min(Math.max(-rect.top / range, 0), 1));
            });
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
    }, []);

    return (
        <section ref={sectionRef} className={`relative ${reducedMotion ? 'h-[100svh]' : 'h-[400svh]'} bg-slate-50`}>
            <div className="sticky top-0 flex h-[100svh] items-center">
                <div className="mx-auto w-full max-w-7xl px-6">
                    {children}
                    <div className="relative mx-auto mt-12 h-[min(22rem,58svh)] max-w-4xl overflow-visible">
                        {features.map((feature, index) => {
                            const remainingStages = Math.max(0, index - progress * (features.length - 1));
                            const travel = remainingStages * 100;
                            const peek = index * 10;
                            const scale = 1 - Math.min(remainingStages * 0.02, 0.08);
                            const isTopCard = index === features.length - 1;
                            return <article key={feature.title} className={`absolute inset-0 will-change-transform rounded-2xl border p-6 ${isTopCard ? 'shadow-[0_6px_16px_rgba(15,23,42,0.08)]' : 'shadow-none'} sm:p-10 lg:p-12 ${feature.className}`} style={{ zIndex: index + 1, transform: `translateY(calc(${travel}% + ${peek}px)) scale(${scale})` }}>
                                <p className="mb-6 text-sm font-semibold opacity-70">{feature.eyebrow}</p>
                                <h3 className="mb-3 text-3xl font-extrabold">{feature.title}</h3>
                                <p className="max-w-xl text-lg leading-relaxed opacity-80">{feature.description}</p>
                            </article>;
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
