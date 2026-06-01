"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Match } from "@/data/schedule";
import { getFlag } from "@/lib/flags";
import {
  getUserTimezone,
  getDateKeyInTz,
  isInPast,
  isToday,
  formatTimeLocal,
  getWeekdayShort,
  formatShortDate,
} from "@/lib/dates";

const PAGE_SIZE = 10;

interface PaginatedScheduleProps {
  matches: Match[];
}

export function PaginatedSchedule({ matches }: PaginatedScheduleProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [userTz, setUserTz] = useState("UTC");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStage, setActiveStage] = useState<"all" | Match["stage"]>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUserTz(getUserTimezone());
  }, []);

  const filtered = useMemo(() => {
    return matches
      .filter((m) => {
        const stageMatch = activeStage === "all" || m.stage === activeStage;
        const term = search.toLowerCase().trim();
        const searchMatch =
          !term ||
          m.teamA.toLowerCase().includes(term) ||
          m.teamB.toLowerCase().includes(term) ||
          (m.city && m.city.toLowerCase().includes(term)) ||
          (m.venue && m.venue.toLowerCase().includes(term));
        return stageMatch && searchMatch;
      })
      .sort((a, b) => a.datetime.localeCompare(b.datetime));
  }, [matches, activeStage, search]);

  const todayPage = useMemo(() => {
    const todayKey = getDateKeyInTz(new Date(), userTz);
    const idx = filtered.findIndex((m) => getDateKeyInTz(m.datetime, userTz) === todayKey);
    if (idx === -1) return 1;
    return Math.floor(idx / PAGE_SIZE) + 1;
  }, [filtered, userTz]);

  useEffect(() => {
    if (userTz !== "UTC" && filtered.length > 0) {
      setCurrentPage(todayPage);
    }
  }, [userTz, todayPage, filtered.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageMatches = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const stages: Array<"all" | Match["stage"]> = ["all", "group", "round-of-32", "round-of-16", "quarter-final", "semi-final", "third-place", "final"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => { setActiveStage(s); setCurrentPage(1); }}
              className={`tab-ghost ${activeStage === s ? "active" : ""}`}
            >
              {t(`schedule.stage.${s}`)}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder={t("schedule.searchPlaceholder")}
          className="form-input max-w-xs sm:ml-auto"
        />
      </div>

      <div className="flex flex-col gap-2 overflow-x-hidden">
        {pageMatches.length === 0 && (
          <div className="card-marketing text-center text-[var(--color-mute)] py-8">
            {t("schedule.empty")}
          </div>
        )}

        {pageMatches.map((match) => {
          const past = isInPast(match.datetime, userTz);
          const todayMatch = isToday(match.datetime, userTz);
          const localTime = formatTimeLocal(match.datetime, userTz);
          const weekday = getWeekdayShort(match.datetime, locale, userTz);
          const dateStr = formatShortDate(match.datetime, locale, userTz);

          return (
            <div
              key={match.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-canvas)] hover:border-[var(--color-hairline-strong)] hover:shadow-xs transition-all gap-2 sm:gap-4 min-w-0 ${
                past ? "opacity-55" : ""
              } ${todayMatch ? "ring-1 ring-[var(--color-link)] border-[var(--color-link)]" : ""}`}
            >
              {/* Date & Time Column */}
              <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-start w-full sm:w-28 shrink-0 pb-1.5 sm:pb-0 border-b sm:border-b-0 border-[var(--color-hairline)]">
                <span className="caption-mono text-[var(--color-mute)] tracking-wider whitespace-nowrap text-[10px] sm:text-[11px]">{weekday} {dateStr}</span>
                <span className="font-mono text-[14px] sm:text-base font-semibold tabular-nums text-[var(--color-ink)] mt-0.5">{localTime}</span>
              </div>

              {/* Match Teams Column */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2.5 flex-wrap text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xl sm:text-2xl leading-none">{getFlag(match.teamA)}</span>
                    <span className="truncate max-w-[140px] sm:max-w-none">{match.teamA}</span>
                  </span>
                  <span className="text-xs text-[var(--color-mute)] font-normal px-0.5">{t("schedule.vs")}</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xl sm:text-2xl leading-none">{getFlag(match.teamB)}</span>
                    <span className="truncate max-w-[140px] sm:max-w-none">{match.teamB}</span>
                  </span>
                </div>
              </div>

              {/* Venue & Group Badge Column */}
              <div className="flex justify-between sm:justify-center items-center sm:items-end gap-2 w-full sm:w-auto text-xs shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[var(--color-hairline)] sm:flex-col">
                <span className="text-[var(--color-body)] text-[11px] sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none order-1 sm:order-2">{match.venue}</span>
                <div className="flex items-center gap-1.5 order-2 sm:order-1">
                  {match.group && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] text-[9px] sm:text-[10px] font-mono text-[var(--color-mute)] font-medium">
                      {t("schedule.groupLabel", { group: match.group })}
                    </span>
                  )}
                  {todayMatch && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-link-bg-soft)] border border-[var(--color-link)]/20 text-[9px] sm:text-[10px] font-medium text-[var(--color-link)]">
                      {t("common.today")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="button-secondary-sm disabled:opacity-40"
          >
            ← {t("common.previous")}
          </button>

          <span className="text-sm text-[var(--color-mute)]">
            {t("common.page")} {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="button-secondary-sm disabled:opacity-40"
          >
            {t("common.next")} →
          </button>
        </div>
      )}

      <p className="caption mt-4 text-[var(--color-mute)]">
        {t("schedule.note")} ({userTz})
      </p>
    </div>
  );
}
