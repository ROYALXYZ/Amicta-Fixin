import { type ReactNode } from 'react';
import { BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
    { title: 'Pelaporan Instan', description: 'Laporkan kerusakan lengkap dengan foto dan detail unit tanpa proses yang rumit.', className: 'lg:col-span-2 lg:row-span-2', image: '/assets/foto_tangan.jpg' },
    { title: 'Dispatch Otomatis', description: 'Tiket diteruskan ke teknisi yang tepat dengan alur kerja yang jelas.', className: 'lg:col-span-4', image: '/assets/dispatch_otomatis.jpg' },
    { title: 'Notifikasi Real-time', description: 'Pembaruan status selalu terlihat oleh penghuni, admin, dan teknisi.', className: 'lg:col-span-4', image: '/assets/notifikasi_real_time.png' },
    { title: 'Riwayat Lengkap', description: 'Seluruh riwayat perbaikan tersimpan rapi sebagai arsip.', className: 'lg:col-span-2', image: '/assets/riwayat_lengkap.jpg' },
    { title: 'Audit Pekerjaan', description: 'Bukti foto dan stempel waktu membuat setiap pekerjaan mudah ditinjau.', className: 'lg:col-span-2', image: '/assets/audit_pekerjaan.png' },
    { title: 'Akses Mobile', description: 'Akses FixIn kapan saja dari perangkat yang digunakan di lapangan.', className: 'lg:col-span-2', image: '/assets/akses_mobile.png' },
];

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('grid grid-cols-1 gap-4 lg:auto-rows-[12rem] lg:grid-cols-6', className)}>{children}</div>;
}

export function BentoCard({ title, description, className, image }: (typeof features)[number]) {
    return <article data-aos="fade-up" className={cn('group relative min-h-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5 lg:min-h-0', className)}>
        {image ? (
            <div className="absolute inset-x-0 top-0 h-2/3 overflow-hidden bg-slate-50/50">
                {title === 'Akses Mobile' ? (
                    <div className="absolute -bottom-16 left-1/2 w-48 -translate-x-1/2 rounded-[2rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl transition-transform duration-500 group-hover:-translate-y-4">
                        <img src={image} alt={title} className="w-full h-auto rounded-[1.5rem] object-cover" />
                    </div>
                ) : (
                    <img src={image} alt={title} className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", title === 'Audit Pekerjaan' ? 'object-top' : 'object-center')} />
                )}
                
                {title === 'Notifikasi Real-time' && (
                    <div className="absolute left-1/2 top-6 flex w-64 -translate-x-1/2 items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 shadow-2xl backdrop-blur-md border border-slate-200 transition-transform duration-500 group-hover:-translate-y-1">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600"><BellRing className="size-5" /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Perbaikan Selesai</p>
                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Teknisi telah menyelesaikan perbaikan di Unit A-301.</p>
                        </div>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
            </div>
        ) : (
            <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-violet-50 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        )}
        <div className="relative flex h-full flex-col justify-between p-6">
            <div className="mt-auto max-w-md pt-16"><h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>
        </div>
    </article>;
}

export default function FeatureGrid({ children }: { children?: ReactNode }) {
    return <div className="mx-auto w-full max-w-7xl px-6">{children}<BentoGrid className="mt-10">{features.map((feature) => <BentoCard key={feature.title} {...feature} />)}</BentoGrid></div>;
}
