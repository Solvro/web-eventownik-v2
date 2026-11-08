"use client";

import { useEffect, useState } from "react";

export function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    update();
    const interval = setInterval(update, 60_000);

    return () => {
      clearInterval(interval);
    };
  }, [targetDate]);

  return (
    <div className="flex items-center gap-6 rounded-3xl bg-white px-6 py-4 shadow-sm">
      {(
        [
          { value: timeLeft.days, label: "dni" },
          { value: timeLeft.hours, label: "godz" },
          { value: timeLeft.minutes, label: "min" },
        ] as const
      ).map(({ value, label }) => (
        <div key={label} className="flex w-[30px] flex-col items-center">
          <p className="text-2xl font-bold tracking-tight text-black">
            {String(value).padStart(2, "0")}
          </p>
          <p className="text-xs text-[#878787]">{label}</p>
        </div>
      ))}
    </div>
  );
}
