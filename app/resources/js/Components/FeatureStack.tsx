import { type ReactNode } from 'react';
import { Zap, Send, BellRing, History, ShieldCheck, Smartphone } from 'lucide-react';

const features = [
    {
        title: 'Pelaporan Instan',
        description: 'Resident dapat melaporkan kerusakan dalam hitungan detik, lengkap dengan foto dan detail unit tanpa proses yang rumit.',
        icon: Zap,
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-700'
    },
    {
        title: 'Dispatch Otomatis',
        description: 'Sistem cerdas akan langsung meneruskan tiket laporan ke teknisi yang tepat tanpa perlu campur tangan manual admin.',
        icon: Send,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-700'
    },
    {
        title: 'Notifikasi Real-time',
        description: 'Penghuni dan teknisi selalu mendapat pembaruan status terkini. Tidak ada lagi miskomunikasi karena semua transparan.',
        icon: BellRing,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700'
    },
    {
        title: 'Riwayat Lengkap',
        description: 'Seluruh riwayat perbaikan tersimpan rapi sebagai arsip. Memudahkan pelacakan masalah berulang pada unit yang sama.',
        icon: History,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-700'
    },
    {
        title: 'Audit Pekerjaan',
        description: 'Dilengkapi bukti foto perbaikan dan stempel waktu, memastikan setiap pekerjaan teknisi dapat diaudit dengan mudah.',
        icon: ShieldCheck,
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-700'
    },
    {
        title: 'Akses Mobile',
        description: 'Platform dirancang responsif, memudahkan teknisi di lapangan dan penghuni untuk mengakses FixIn kapan saja, di mana saja.',
        icon: Smartphone,
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-700'
    }
];

export default function FeatureStack({ children }: { children?: ReactNode }) {
    return (
        <section className="py-16 lg:py-12 bg-slate-50">
            <div className="mx-auto w-full max-w-7xl px-6">
                {children}
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature) => (
                        <article 
                            key={feature.title} 
                            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${feature.iconBg} ${feature.iconColor}`}>
                                <feature.icon strokeWidth={2.5} className="w-5 h-5" />
                            </div>
                            <h3 className="mb-2 text-base font-semibold text-slate-900">{feature.title}</h3>
                            <p className="text-slate-500 text-[13px] leading-relaxed">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
