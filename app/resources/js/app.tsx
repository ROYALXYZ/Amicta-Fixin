import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { configureEcho } from '@laravel/echo-react';
import { Toaster } from 'sonner';

configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT),
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
let navigation: { from: string; startedAt: number } | null = null;

router.on('start', (event) => {
    navigation = { from: window.location.pathname, startedAt: performance.now() };
    console.info('[Navigation benchmark:start]', { from: navigation.from, to: event.detail.visit.url });
});

router.on('finish', (event) => {
    const visit = event.detail.visit;
    const benchmark = navigation;
    navigation = null;

    if (!benchmark) return;
    const url = new URL(visit.url, window.location.origin).href;
    const resource = performance.getEntriesByName(url).at(-1) as PerformanceResourceTiming | undefined;
    const appTiming = resource?.serverTiming.find((timing) => timing.name === 'app');
    const databaseTiming = resource?.serverTiming.find((timing) => timing.name === 'db');

    console.info('[Navigation benchmark]', {
        from: benchmark.from,
        to: new URL(url).pathname,
        durationMs: Math.round(performance.now() - benchmark.startedAt),
        networkMs: resource ? Math.round(resource.duration) : null,
        serverMs: appTiming ? Math.round(appTiming.duration) : null,
        dbMs: databaseTiming ? Math.round(databaseTiming.duration) : null,
        completed: visit.completed,
        interrupted: visit.interrupted,
        cancelled: visit.cancelled,
    });
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

         root.render(<><App {...props} /><Toaster position="top-right" richColors closeButton /></>);
    },
    progress: {
        color: '#4B5563',
    },
});
