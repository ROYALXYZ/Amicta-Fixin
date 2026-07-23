import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import ColorBends from '@/Components/ColorBends.jsx';
import { Button } from '@/Components/ui/button';

const ErrorBackground = ColorBends as any;

type Props = { status: number; title: string; message: string; detail: string };

export default function Show({ status, title, message, detail }: Props) {
    return (
        <>
            <Head title={`${status} - ${title}`} />
            <main className="grid min-h-screen bg-white text-slate-950 lg:grid-cols-2">
                <section className="flex items-center justify-center px-6 py-16 sm:px-12 lg:px-16">
                    <div className="w-full max-w-md text-center">
                        <p className="font-mono text-sm font-bold tracking-[0.3em] text-slate-400">ERROR {status}</p>
                        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{status === 404 ? 'Whoops!' : title}</h1>
                        <h2 className="mt-4 text-xl font-semibold sm:text-2xl">{status === 404 ? 'Halaman tidak ditemukan' : title}</h2>
                        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-500">{message}</p>
                        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-400">{detail}</p>
                        <div className="mx-auto mt-8 grid w-full max-w-sm gap-3 sm:grid-cols-2">
                            <Button asChild size="lg"><Link href="/"><Home /> Kembali ke beranda</Link></Button>
                            <Button type="button" variant="outline" size="lg" onClick={() => window.location.reload()}><RefreshCw /> Coba lagi</Button>
                        </div>
                        <Button type="button" variant="link" size="sm" onClick={() => window.history.back()} className="mt-3 text-muted-foreground"><ArrowLeft /> Halaman sebelumnya</Button>
                    </div>
                </section>
                <aside className="relative hidden min-h-[280px] overflow-hidden bg-slate-950 lg:block" aria-label="Area ilustrasi error">
                    <div className="absolute inset-0">
                        <ErrorBackground
                            rotation={90}
                            speed={0.2}
                            colors={["#5227FF", "#ffffff", "#7C3AED"]}
                            transparent
                            autoRotate={0}
                            scale={1}
                            frequency={1}
                            warpStrength={1}
                            mouseInfluence={1}
                            parallax={0.5}
                            noise={0.15}
                            iterations={1}
                            intensity={1.5}
                            bandWidth={6}
                        />
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none font-black leading-none tracking-[-0.08em] text-white/90" aria-hidden="true"><span className="text-[clamp(12rem,24vw,24rem)]">{status}</span></div>
                </aside>
            </main>
        </>
    );
}
