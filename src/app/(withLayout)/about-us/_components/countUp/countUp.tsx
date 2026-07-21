"use client";

import { useEffect, useRef, useState } from "react";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";

type CountUpProps = {
    to: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
};

export default function CountUp({ to, duration = 1600, prefix = "", suffix = "", className }: CountUpProps) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !started.current) {
                    started.current = true;
                    const start = performance.now();
                    const tick = (now: number) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setValue(Math.round(eased * to));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [to, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {convertToPersianNumber(value)}
            {suffix}
        </span>
    );
}
