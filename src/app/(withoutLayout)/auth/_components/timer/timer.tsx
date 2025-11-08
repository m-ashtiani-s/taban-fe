import { forwardRef, useImperativeHandle } from "react";
import { TimerProps, TimerRef } from "./timer.types";
import { useTimer } from "react-timer-hook";
import classNames from "classnames";
import { padWithZero } from "@/utils/string";
import { Size } from "@/types/component-base.type";

const sizeClasses: Record<Size, string> = {
    tiny: "timer-xs",
    small: "timer-sm",
    normal: "timer-md",
    large: "timer-lg",
};

const calculateTotalSeconds = (days: number, hours: number, minutes: number, seconds: number): number => days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;

export const Timer = forwardRef<TimerRef, TimerProps>(
    ({ expiryTimestamp, autoStart, onExpire, size = "normal", className, showTitle = true, showDays = true, showHours = true, variant = "primary" }, ref) => {
        const { days, hours, minutes, seconds, start, pause, resume, restart } = useTimer({ expiryTimestamp, onExpire, autoStart });

        const classes = classNames("timer", { [`${sizeClasses[size]}`]: size }, { [`timer-${variant}`]: variant }, className);

        useImperativeHandle(ref, () => ({
            start,
            pause,
            resume,
            restart,
        }));

        const renderTimerProgress = (unit: number) => {
            return <span lang="en">{padWithZero(unit.toString(), 2)}</span>;
        };

        const timeUnits = [
            {
                show: showDays && days != null,
                unit: days,
            },
            {
                show: showHours && hours != null,
                unit: hours,
            },
            {
                show: minutes != null,
                unit: minutes,
            },
            {
                show: seconds != null,
                unit: seconds,
            },
        ];

        const renderedTimeUnits = timeUnits
            .filter(({ show }) => show)
            .map(({ unit }, index, array) => (
                <span key={index}>
                    {renderTimerProgress(unit)}
                    {index < array.length - 1 && <span>:</span>}
                </span>
            ));

        return <div className="w-fit">{renderedTimeUnits}</div>;
    }
);
