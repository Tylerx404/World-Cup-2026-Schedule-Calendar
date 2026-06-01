"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Match } from "@/data/schedule";
import { Link } from "@/i18n/navigation";
import { getFlag } from "@/lib/flags";
import {
  getUserTimezone,
  getDateKeyInTz,
  isInPast,
  formatTimeLocal,
} from "@/lib/dates";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariants, backdropVariants, useSafeMotion } from "@/lib/motion";

function getStageColor(stage: Match["stage"]): string {
  if (stage === "group") return "#0070f3";
  if (stage === "round-of-32" || stage === "round-of-16") return "#7928ca";
  if (stage === "quarter-final" || stage === "semi-final") return "#ff0080";
  return "#f5a623";
}

interface MonthCalendarProps {
  matches: Match[];
}

const MONTH_DEFS: Array<{ key: "2026-06" | "2026-07"; label: "june2026" | "july2026" }> = [
  { key: "2026-06", label: "june2026" as const },
  { key: "2026-07", label: "july2026" as const },
];

export function MonthCalendar({ matches }: MonthCalendarProps) {
  const t = useTranslations();
  const { shouldReduce } = useSafeMotion();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [userTz, setUserTz] = useState<string>("UTC");
  const [activeMonth, setActiveMonth] = useState<"2026-06" | "2026-07">("2026-06");

  useEffect(() => {
    setUserTz(getUserTimezone());
  }, []);

  const matchesByDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of matches) {
      const key = getDateKeyInTz(m.datetime, userTz);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.datetime.localeCompare(b.datetime));
    return map;
  }, [matches, userTz]);

  const todayKey = useMemo(() => getDateKeyInTz(new Date(), userTz), [userTz]);

  useEffect(() => {
    if (userTz !== "UTC" && !selectedDate && matchesByDate.has(todayKey)) {
      setSelectedDate(todayKey);
    }
  }, [userTz, todayKey, matchesByDate, selectedDate]);

  useEffect(() => {
    if (userTz === "UTC") return;
    const monthOfToday = todayKey.slice(0, 7);
    if (MONTH_DEFS.some((m) => m.key === monthOfToday) && matchesByDate.has(todayKey)) {
      setActiveMonth(monthOfToday as "2026-06" | "2026-07");
    }
  }, [userTz, todayKey, matchesByDate]);

  useEffect(() => {
    if (selectedDate) {
      const originalOverflowBody = document.body.style.overflow;
      const originalOverflowHtml = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflowBody;
        document.documentElement.style.overflow = originalOverflowHtml;
      };
    }
  }, [selectedDate]);

  const selectedMatches = selectedDate ? (matchesByDate.get(selectedDate) ?? []) : [];

  function handleDayClick(dateKey: string) {
    setSelectedDate(dateKey === selectedDate ? null : dateKey);
  }

  const hasMatches = (dateKey: string) => matchesByDate.has(dateKey);

  function renderMonth(monthKey: string, labelKey: "june2026" | "july2026") {
    const [year, month] = monthKey.split("-").map(Number);
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const startDay = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const weeks: Array<Array<{ day: number; dateKey: string } | null>> = [];
    let week: Array<{ day: number; dateKey: string } | null> = [];

    for (let i = 0; i < startDay; i++) week.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      week.push({ day: d, dateKey });
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return (
      <div key={monthKey}>
        <div className="calendar-grid-header grid grid-cols-7 text-center mb-1">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((wd, i) => (
            <div key={i} className="caption-mono text-[var(--color-mute)] py-1 text-xs">{wd}</div>
          ))}
        </div>

        <div className="calendar-grid border border-[var(--color-hairline)] rounded-xl overflow-hidden bg-[var(--color-canvas)]">
          {weeks.map((week, wi) => (
            <div key={wi} className="calendar-week grid grid-cols-7">
              {week.map((cell, ci) => {
                if (!cell) {
                  return <div key={ci} className="calendar-day empty border-r border-b border-[var(--color-hairline)] last:border-r-0" />;
                }
                const has = hasMatches(cell.dateKey);
                const isSelected = selectedDate === cell.dateKey;
                const isToday = cell.dateKey === todayKey;
                const isPast = cell.dateKey < todayKey;
                const dayMatches = matchesByDate.get(cell.dateKey) ?? [];

                return (
                  <div
                    key={ci}
                    className={`calendar-day group text-left border-r border-b border-[var(--color-hairline)] last:border-r-0 transition-colors relative min-w-0 ${
                      has ? "has-matches" : ""
                    } ${isSelected ? "selected" : ""} ${isPast ? "past" : ""} ${isToday ? "is-today" : ""}`}
                    onClick={() => has && handleDayClick(cell.dateKey)}
                    onMouseEnter={() => has && setHoveredDate(cell.dateKey)}
                    onMouseLeave={() => setHoveredDate(null)}
                    style={{ cursor: has ? "pointer" : "default" }}
                  >
                    <div className="sm:hidden flex flex-col items-center justify-center h-full text-center py-1">
                      <span className="text-base font-medium text-[var(--color-ink)]">{cell.day}</span>
                      {has && (
                        <span className="mt-0.5 text-[10px] px-1.5 py-px rounded-full bg-[var(--color-link-bg-soft)] text-[var(--color-link)] font-medium tabular-nums">
                          {dayMatches.length}
                        </span>
                      )}
                    </div>

                    <div className="hidden sm:block p-1 md:p-1.5 lg:p-2 min-h-[64px] lg:min-h-[76px] w-full min-w-0">
                      <div className="flex items-start justify-between w-full min-w-0">
                        <span className="text-xs md:text-sm font-medium text-[var(--color-ink)]">{cell.day}</span>
                        {has && (
                          <span className="text-[8px] md:text-[10px] px-1 md:px-1.5 py-px rounded bg-[var(--color-link-bg-soft)] text-[var(--color-link)] shrink-0">
                            {dayMatches.length}
                          </span>
                        )}
                      </div>

                      {has && (
                        <div className="mt-0.5 md:mt-1 space-y-0.5 w-full min-w-0">
                          {dayMatches.slice(0, 2).map((m, idx) => (
                            <div key={idx} className="text-[8px] lg:text-[9px] leading-tight text-[var(--color-body)] flex items-center gap-0.5 md:gap-1 w-full min-w-0">
                              <span className="inline-block w-1 h-1 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getStageColor(m.stage) }} />
                              <span className="truncate">{getFlag(m.teamA)} {m.teamA.split(" ").pop()} {t("schedule.vs")} {m.teamB.split(" ").pop()}</span>
                            </div>
                          ))}
                          {dayMatches.length > 2 && (
                            <div className="text-[8px] lg:text-[9px] text-[var(--color-mute)] truncate w-full">+{dayMatches.length - 2} {t("calendar.moreMatches")}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {hoveredDate === cell.dateKey && has && (
                      <div 
                        className={`calendar-tooltip hidden sm:block absolute z-[100] p-3 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] shadow-md text-xs min-w-[240px] max-w-[280px] ${
                          wi <= 1 ? "top-full mt-2" : "bottom-full mb-2"
                        } ${
                          ci <= 1 ? "left-1" : ci >= 5 ? "right-1" : "left-1/2 -translate-x-1/2"
                        }`}
                      >
                        {dayMatches.map((m, i) => (
                          <div key={i} className="py-0.5 flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-[var(--color-mute)] w-9 flex-shrink-0">
                              {formatTimeLocal(m.datetime, userTz)}
                            </span>
                            <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: getStageColor(m.stage) }} />
                            <span>
                              {getFlag(m.teamA)} {m.teamA} <span className="text-[var(--color-mute)]">vs</span> {getFlag(m.teamB)} {m.teamB}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-wrapper">
      <div className="flex gap-2 mb-3">
        {MONTH_DEFS.map((m) => {
          const isActive = activeMonth === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setActiveMonth(m.key)}
              className={`text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg border transition-colors flex-1 sm:flex-none text-center ${
                isActive
                  ? "bg-[var(--color-ink)] text-[var(--color-canvas)] border-[var(--color-ink)]"
                  : "border-[var(--color-hairline)] hover:bg-[var(--color-canvas-soft)] text-[var(--color-body)]"
              }`}
            >
              {t(`calendar.months.${m.label}`)}
            </button>
          );
        })}
      </div>

      {(() => {
        const activeDef = MONTH_DEFS.find((m) => m.key === activeMonth)!;
        return renderMonth(activeDef.key, activeDef.label);
      })()}

      <AnimatePresence>
        {selectedDate && selectedMatches.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overscroll-contain"
            onClick={() => setSelectedDate(null)}
            {...(!shouldReduce && {
              variants: backdropVariants as any,
              initial: "hidden",
              animate: "visible",
              exit: "exit",
            })}
          >
            <motion.div
              className="card-marketing-large w-full max-w-[620px] relative"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: "0 1px 1px #00000005, 0 8px 16px -4px #0000000a, 0 24px 32px -8px #0000000f",
              }}
              {...(!shouldReduce && {
                variants: modalVariants as any,
                initial: "hidden",
                animate: "visible",
                exit: "exit",
              })}
            >
              <button
                onClick={() => setSelectedDate(null)}
                className="absolute top-4 right-4 text-[var(--color-mute)] hover:text-[var(--color-ink)] text-2xl leading-none"
                aria-label={t("common.close")}
              >
                ×
              </button>

              <div className="pr-8">
                <div className="caption-mono text-[var(--color-mute)]">
                  {selectedDate === todayKey ? t("calendar.today") : t("calendar.selectedDay")}
                </div>
                <div className="body-md-strong text-lg">{selectedDate}</div>
              </div>

              <div className="mt-4 space-y-3 max-h-[52vh] overflow-auto overscroll-contain pr-1 text-sm">
                {selectedMatches.map((match) => {
                  const localTime = formatTimeLocal(match.datetime, userTz);
                  const past = isInPast(match.datetime, userTz);
                  return (
                    <div
                      key={match.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-2 pb-3 border-b border-[var(--color-hairline)] last:border-0 last:pb-0 ${past ? "opacity-50" : ""}`}
                    >
                      <div className="w-16 sm:w-20 font-mono text-[var(--color-mute)] flex-shrink-0 text-sm">{localTime}</div>
                      <div className="flex-1 font-medium">
                        {getFlag(match.teamA)} {match.teamA} <span className="text-[var(--color-mute)] mx-1">{t("schedule.vs")}</span> {getFlag(match.teamB)} {match.teamB}
                      </div>
                      <div className="text-[var(--color-body)] text-sm">
                        {match.venue}
                        {match.group && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[var(--color-canvas-soft)]">
                            {t("schedule.groupLabel", { group: match.group })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-hairline)]">
                <Link href="/schedule" className="text-sm text-[var(--color-link)] hover:underline">
                  {t("calendar.viewFullSchedule")} →
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="caption mt-3 text-[var(--color-mute)]">{t("calendar.note", { tz: userTz })}</p>
    </div>
  );
}
