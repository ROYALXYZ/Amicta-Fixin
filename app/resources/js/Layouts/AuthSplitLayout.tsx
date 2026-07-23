import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import ShapeGrid from '@/Components/ShapeGrid';
import { Button } from '@/Components/ui/button';

export default function AuthSplitLayout({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; children: ReactNode }) {
    return <div className="min-h-screen bg-[#FAFAFC] text-slate-900 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)]">
        <section className="relative hidden min-h-screen overflow-hidden bg-slate-50 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
            <ShapeGrid speed={0.2} squareSize={48} direction="diagonal" borderColor="rgba(124, 58, 237, 0.18)" hoverFillColor="rgba(124, 58, 237, 0.32)" shape="square" hoverTrailAmount={5} className="pointer-events-none absolute inset-0 z-0 opacity-55" />
            <div className="relative z-10 flex items-center justify-between">
                <Link href="/">
                    <img src="/assets/FixIn.png" alt="FixIn Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-violet-700"><ArrowLeft className="size-4" />Kembali</Link>
            </div>
            <div className="relative z-10 max-w-xl">
                <p className="mb-4 text-sm font-semibold text-violet-700">{eyebrow}</p>
                <h1 className="max-w-lg text-4xl font-extrabold leading-tight tracking-tight text-slate-950 xl:text-5xl">{title}</h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">{description}</p>
                <Button asChild className="mt-8 bg-rose-600 text-white shadow-sm shadow-rose-900/20 hover:bg-rose-700"><Link href={route('urgent.create')}><AlertTriangle data-icon="inline-start" />Laporan Emergency</Link></Button>
                <p className="mt-3 text-xs text-slate-500">Untuk kerusakan fasilitas yang perlu segera ditangani.</p>
            </div>
            <p className="relative z-10 text-sm text-slate-500">Platform operasional gedung yang membantu semua pihak bekerja lebih rapi.</p>
        </section>
        <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
            <div className="w-full max-w-md">{children}</div>
        </main>
    </div>;
}
