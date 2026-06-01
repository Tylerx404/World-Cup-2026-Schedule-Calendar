"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import type { Match } from "@/data/schedule";
import { getFlag } from "@/lib/flags";
import { formatTimeLocal, getDateKeyInTz } from "@/lib/dates";
import { useSafeMotion } from "@/lib/motion";

interface HeroProps {
  matches: Match[];
}

interface CalendarDay {
  dayNumber: number;
  month: number;
  isCurrentMonth: boolean;
  dateKey: string;
}

export function Hero({ matches }: HeroProps) {
  const t = useTranslations("hero");
  const tSchedule = useTranslations("schedule");
  const locale = useLocale();
  const { shouldReduce } = useSafeMotion();

  const [selectedMonth, setSelectedMonth] = useState<6 | 7>(6);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const matchesByDate = useMemo(() => {
    const map: Record<string, Match[]> = {};
    matches.forEach((m) => {
      const dateKey = getDateKeyInTz(m.datetime);
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(m);
    });
    return map;
  }, [matches]);

  const calendarCells = useMemo(() => {
    const cells: CalendarDay[] = [];
    if (selectedMonth === 6) {
      for (let i = 1; i <= 30; i++) {
        const dd = i < 10 ? `0${i}` : `${i}`;
        cells.push({
          dayNumber: i,
          month: 6,
          isCurrentMonth: true,
          dateKey: `2026-06-${dd}`,
        });
      }
      for (let i = 1; i <= 5; i++) {
        const dd = `0${i}`;
        cells.push({
          dayNumber: i,
          month: 7,
          isCurrentMonth: false,
          dateKey: `2026-07-${dd}`,
        });
      }
    } else {
      cells.push({
        dayNumber: 29,
        month: 6,
        isCurrentMonth: false,
        dateKey: `2026-06-29`,
      });
      cells.push({
        dayNumber: 30,
        month: 6,
        isCurrentMonth: false,
        dateKey: `2026-06-30`,
      });
      for (let i = 1; i <= 31; i++) {
        const dd = i < 10 ? `0${i}` : `${i}`;
        cells.push({
          dayNumber: i,
          month: 7,
          isCurrentMonth: true,
          dateKey: `2026-07-${dd}`,
        });
      }
      for (let i = 1; i <= 2; i++) {
        const dd = `0${i}`;
        cells.push({
          dayNumber: i,
          month: 8,
          isCurrentMonth: false,
          dateKey: `2026-08-${dd}`,
        });
      }
    }
    return cells;
  }, [selectedMonth]);

  useEffect(() => {
    const monthStr = selectedMonth === 6 ? "-06-" : "-07-";
    if (!selectedDate || !selectedDate.includes(monthStr)) {
      const matchDates = Object.keys(matchesByDate)
        .filter((d) => d.includes(monthStr))
        .sort();
      if (matchDates.length > 0) {
        setSelectedDate(matchDates[0]);
      } else {
        setSelectedDate(`2026-00${selectedMonth}-01`.replace("-00", "-0"));
      }
    }
  }, [selectedMonth, matchesByDate, selectedDate]);

  const selectedDateMatches = selectedDate ? matchesByDate[selectedDate] || [] : [];

  const weekdays = [
    t("calendar.mon"),
    t("calendar.tue"),
    t("calendar.wed"),
    t("calendar.thu"),
    t("calendar.fri"),
    t("calendar.sat"),
    t("calendar.sun"),
  ];

  const getStageLabel = (match: Match) => {
    if (match.stage === "group") {
      return `${tSchedule("stage.group")} ${match.group}`;
    }
    return tSchedule(`stage.${match.stage}`);
  };

  const handleDayClick = (cell: CalendarDay) => {
    setSelectedDate(cell.dateKey);
    if (cell.month !== selectedMonth && (cell.month === 6 || cell.month === 7)) {
      setSelectedMonth(cell.month as 6 | 7);
    }
  };

  return (
    <section className="relative min-h-[620px] md:min-h-[700px] flex items-center bg-[var(--color-canvas)] pt-10 pb-14 md:pt-0 md:pb-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-canvas)] via-[var(--color-canvas-soft)] to-[var(--color-canvas)]" />
      
      {!shouldReduce && (
        <>
          <div className="absolute top-[-10%] right-[5%] w-[min(420px,80vw)] h-[min(420px,80vw)] rounded-full bg-[var(--color-wc-gold)]/8 blur-[120px] animate-[wcOrb_25s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-15%] left-[8%] w-[min(380px,75vw)] h-[min(380px,75vw)] rounded-full bg-[var(--color-wc-red)]/6 blur-[100px] animate-[wcOrb_32s_ease-in-out_infinite_3s]" />
          <div className="absolute top-[30%] left-[15%] w-[min(260px,55vw)] h-[min(260px,55vw)] rounded-full bg-[var(--color-wc-blue)]/5 blur-[90px] animate-[wcOrb_28s_ease-in-out_infinite_7s]" />
        </>
      )}

      <div className="container relative z-10 max-w-[1200px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-10 items-center">
          
          <div className="lg:col-span-7 xl:col-span-6 2xl:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-wc-gold-soft)] px-4 py-1 text-sm font-medium text-[var(--color-ink)] mb-6">
              <span>11.06 — 19.07.2026 • Canada • Mexico • USA</span>
            </div>

            <h1 className="display-xl tracking-[-2.8px] max-w-[16ch] mb-6">
              {t("headline")}
            </h1>

            <p className="body-lg max-w-[48ch] text-[var(--color-body)] mb-8">
              {t("subheadline")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/add-to-calendar" 
                className="button-primary text-base px-8"
              >
                {t("primaryCta")}
              </Link>
              <Link 
                href="/schedule" 
                className="button-secondary text-base px-8"
              >
                {t("secondaryCta")}
              </Link>
            </div>

            <p className="mt-5 text-sm" style={{ color: "var(--color-wc-gold)" }}>
              {t("trust")}
            </p>
          </div>

          <div className="lg:col-span-5 xl:col-span-6 2xl:col-span-6 relative pt-2 lg:pt-8 flex justify-center">
            <div className="relative mx-auto lg:mx-0 max-w-md w-full">
              <div className="relative rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-hairline)] shadow-xl p-5 select-none">
                
                <div className="flex items-center justify-between mb-4 px-1">
                  <div>
                    <div className="text-[10px] tracking-[1.5px] text-[var(--color-mute)] uppercase font-semibold">
                      {t("calendar.title")}
                    </div>
                    <div className="font-semibold text-base tracking-[-0.3px]">
                      WORLD CUP 2026
                    </div>
                  </div>
                  <div className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--color-wc-gold-soft)] text-[var(--color-wc-gold)] border border-[var(--color-wc-gold)]/20 font-semibold tracking-wider">
                    WORLD CUP 26
                  </div>
                </div>

                <div className="grid grid-cols-2 p-0.5 rounded-xl bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] mb-4">
                  <button
                    onClick={() => setSelectedMonth(6)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      selectedMonth === 6
                        ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
                        : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {t("calendar.june")} 2026
                  </button>
                  <button
                    onClick={() => setSelectedMonth(7)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      selectedMonth === 7
                        ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm"
                        : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {t("calendar.july")} 2026
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {weekdays.map((w, idx) => (
                    <div key={idx} className="text-[9px] font-bold text-[var(--color-mute)] uppercase tracking-wider">
                      {w}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                  {calendarCells.map((cell, idx) => {
                    const isSelected = selectedDate === cell.dateKey;
                    const dayMatches = matchesByDate[cell.dateKey] || [];
                    const hasMatches = dayMatches.length > 0;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDayClick(cell)}
                        className="relative w-9 h-9 mx-auto flex items-center justify-center rounded-full text-xs transition-all outline-none cursor-pointer"
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeDay"
                            className="absolute inset-0.5 rounded-full bg-[var(--color-wc-gold)] z-0"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}

                        <span
                          className={`z-10 font-medium ${
                            isSelected
                              ? "text-black font-bold"
                              : cell.isCurrentMonth
                              ? "text-[var(--color-ink)] hover:text-[var(--color-wc-gold)]"
                              : "text-[var(--color-mute)]/35"
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {hasMatches && (
                          <span
                            className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full z-10 ${
                              isSelected ? "bg-black" : "bg-[var(--color-wc-gold)]"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[var(--color-hairline)] pt-3.5 pb-2 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-[var(--color-ink)]">
                    {locale === "vi" 
                      ? `Trận đấu ngày ${selectedDate ? selectedDate.split("-")[2] + "/" + selectedDate.split("-")[1] : ""}`
                      : `Matches for ${selectedDate ? selectedDate.split("-")[1] + "/" + selectedDate.split("-")[2] : ""}`
                    }
                  </span>
                  <span className="text-[9px] text-[var(--color-mute)] tracking-wider">
                    {selectedDateMatches.length} {locale === "vi" ? "trận" : "matches"}
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[135px] overflow-y-auto scrollbar-none pr-0.5 select-none">
                  {selectedDateMatches.length > 0 ? (
                    selectedDateMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-canvas)] hover:border-[var(--color-wc-gold)]/30 hover:bg-[var(--color-canvas-soft)] transition-all cursor-pointer"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base flex-shrink-0 leading-none">{getFlag(match.teamA)}</span>
                            <span className="font-medium text-[12.5px] truncate text-[var(--color-ink)]">{match.teamA}</span>
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base flex-shrink-0 leading-none">{getFlag(match.teamB)}</span>
                            <span className="font-medium text-[12.5px] truncate text-[var(--color-ink)]">{match.teamB}</span>
                          </div>
                        </div>
                        <div className="text-right pl-3 border-l border-[var(--color-hairline)] ml-3 flex-shrink-0 min-w-[70px]">
                          <div className="font-semibold text-xs text-[var(--color-ink)]">
                            {formatTimeLocal(match.datetime)}
                          </div>
                          <div className="text-[8.5px] text-[var(--color-mute)] mt-0.5 truncate uppercase tracking-wider font-mono">
                            {getStageLabel(match)}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-[var(--color-mute)] text-xs border border-dashed border-[var(--color-hairline)] rounded-xl">
                      {t("calendar.noMatches")}
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute -bottom-2 left-4 right-4 h-6 bg-black/5 blur-2xl rounded-full pointer-events-none" aria-hidden />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
