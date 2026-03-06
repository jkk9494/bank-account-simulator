import { useEffect, useState, useRef } from 'react';

interface NumberTickerProps {
    value: number;
    duration?: number;
    formatter?: (val: number) => string;
    className?: string;
}

export default function NumberTicker({
    value,
    duration = 1000,
    formatter = (v) => v.toLocaleString(),
    className
}: NumberTickerProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const previousValue = useRef(value);
    const startTime = useRef<number | null>(null);

    useEffect(() => {
        const start = previousValue.current;
        const end = value;

        if (start === end) return;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);

            // Easing function: easeOutCubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * ease;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                previousValue.current = end;
                startTime.current = null;
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={className}>
            {formatter(displayValue)}
        </span>
    );
}
