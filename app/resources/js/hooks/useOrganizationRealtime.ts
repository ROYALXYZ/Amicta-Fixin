import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useRef } from 'react';
import type { PageProps } from '@/types';

type EventName = 'tickets.changed' | 'technicians.changed';

export function useOrganizationRealtime(event: EventName, only: string[]) {
    const organizationId = usePage<PageProps<{ organization?: { id: number } | null }>>().props.organization?.id;
    const onlyKey = only.join(',');
    const timer = useRef<number>();
    const reloading = useRef(false);
    const pending = useRef(false);

    useEcho(`organization.${organizationId ?? 0}`, `.${event}`, () => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
            if (reloading.current) {
                pending.current = true;
                return;
            }
            reloading.current = true;
            router.reload({
                only,
                onFinish: () => {
                    reloading.current = false;
                    if (pending.current) {
                        pending.current = false;
                        router.reload({ only });
                    }
                },
            });
        }, 300);
    }, [organizationId, event, onlyKey]);
}
