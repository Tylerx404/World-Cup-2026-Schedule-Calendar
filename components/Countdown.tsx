"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OPENING_MATCH_DATETIME } from "@/data/schedule";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TARGET_DATE = new Date(OPENING_MATCH_DATETIME);

function calculateTimeLeft(target: Date): TimeLeft | null {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export function Countdown() {
  const t = useTranslations("countdown");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const initial = calculateTimeLeft(TARGET_DATE);
    setTimeLeft(initial);

    if (!initial) return;

    const interval = setInterval(() => {
      const updated = calculateTimeLeft(TARGET_DATE);
      setTimeLeft(updated);

      if (!updated) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    const labels = [t("labels.days"), t("labels.hours"), t("labels.minutes"), t("labels.seconds")];
    return (
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto md:mx-0">
        {labels.map((label) => (
          <div key={label} className="card-marketing flex flex-col items-center justify-center py-4">
            <div className="countdown-digit tabular-nums">--</div>
            <div className="countdown-label">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="card-marketing-large max-w-md mx-auto md:mx-0 text-center">
        <div className="text-2xl font-semibold mb-1">{t("opened")}</div>
        <p className="body-md text-[var(--color-body)]">
          {t("openedDescription")}
        </p>
      </div>
    );
  }

  const items = [
    { label: t("labels.days"), value: timeLeft.days },
    { label: t("labels.hours"), value: timeLeft.hours },
    { label: t("labels.minutes"), value: timeLeft.minutes },
    { label: t("labels.seconds"), value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 max-w-md mx-auto md:mx-0">
      {items.map((item) => (
        <div 
          key={item.label} 
          className="card-marketing flex flex-col items-center justify-center py-4 elevation-2 text-center"
        >
          <div className="countdown-digit tabular-nums">
            {item.value.toString().padStart(2, "0")}
          </div>
          <div className="countdown-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
