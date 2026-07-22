import { type ReactNode } from 'react';
import { BellRing, History, Send, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
    { title: 'Pelaporan Instan', description: 'Laporkan kerusakan lengkap dengan foto dan detail unit tanpa proses yang rumit.', icon: Zap, className: 'lg:col-span-2 lg:row-span-2', accent: 'violet' },
    { title: 'Dispatch Otomatis', description: 'Tiket diteruskan ke teknisi yang tepat dengan alur kerja yang jelas.', icon: Send, className: 'lg:col-span-4', accent: 'indigo' },
    { title: 'Notifikasi Real-time', description: 'Pembaruan status selalu terlihat oleh penghuni, admin, dan teknisi.', icon: BellRing, className: 'lg:col-span-4', accent: 'blue' },
    { title: 'Riwayat Lengkap', description: 'Seluruh riwayat perbaikan tersimpan rapi sebagai arsip.', icon: History, className: 'lg:col-span-2', accent: 'slate' },
    { title: 'Audit Pekerjaan', description: 'Bukti foto dan stempel waktu membuat setiap pekerjaan mudah ditinjau.', icon: ShieldCheck, className: 'lg:col-span-2', accent: 'slate' },
    { title: 'Akses Mobile', description: 'Akses FixIn kapan saja dari perangkat yang digunakan di lapangan.', icon: Smartphone, className: 'lg:col-span-2', accent: 'violet' },
];

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('grid grid-cols-1 gap-4 lg:auto-rows-[12rem] lg:grid-cols-6', className)}>{children}</div>;
}

export function BentoCard({ title, description, icon: Icon, className, accent }: (typeof features)[number]) {
    return <article data-aos="fade-up" className={cn('group relative min-h-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5 lg:min-h-0', className)}>
        <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-violet-50 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
                <div className="flex size-10 items-center justify-center text-slate-950 transition-colors duration-300 group-hover:text-violet-700"><Icon className="size-5" strokeWidth={1.8} /></div>
                <span className="text-xs font-medium tracking-widest text-slate-300 transition-colors group-hover:text-violet-300">0{features.findIndex((feature) => feature.title === title) + 1}</span>
            </div>
            <div className="mt-auto max-w-md pt-8"><h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>
        </div>
    </article>;
}

export default function FeatureGrid({ children }: { children?: ReactNode }) {
    return <section className="flex min-h-screen items-center bg-[#FBFAFF] py-16 lg:py-12"><div className="mx-auto w-full max-w-7xl px-6">{children}<BentoGrid className="mt-10">{features.map((feature) => <BentoCard key={feature.title} {...feature} />)}</BentoGrid></div></section>;
}
