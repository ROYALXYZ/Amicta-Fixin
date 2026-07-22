import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MarqueeProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    reverse?: boolean;
    pauseOnHover?: boolean;
    repeat?: number;
};

export function Marquee({ className, children, reverse = false, pauseOnHover = false, repeat = 4, ...props }: MarqueeProps) {
    return (
        <div {...props} className={cn('group flex gap-4 overflow-hidden p-2', className)}>
            {Array.from({ length: repeat }, (_, index) => (
                <div key={index} className={cn('flex shrink-0 gap-4 animate-marquee', pauseOnHover && 'group-hover:[animation-play-state:paused]', reverse && '[animation-direction:reverse]')}>
                    {children}
                </div>
            ))}
        </div>
    );
}
