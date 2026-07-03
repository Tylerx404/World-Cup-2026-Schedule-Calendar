"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { GroupStanding, TeamStanding } from "@/lib/standings";
import type { Match } from "@/data/schedule";
import { getFlag } from "@/lib/flags";
import {
  getUserTimezone,
  isFinished,
  isLive,
  formatTimeLocal,
  getWeekdayShort,
  formatShortDate,
} from "@/lib/dates";

const POLL_INTERVAL_MS = 60_000;

interface ApiPayload {
  groups?: GroupStanding[];
  knockoutMatches?: Match[];
  updatedAt?: string;
  error?: string;
}

function formatTime(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function TableHeader({ labels }: { labels: Record<string, string> }) {
  return (
    <thead>
      <tr>
        <th className="text-right w-7 pl-2 pr-1 sticky left-0 z-20 bg-[var(--color-canvas-soft)]">{labels.rank}</th>
        <th className="sticky left-7 z-20 bg-[var(--color-canvas-soft)] shadow-[2px_0_0_var(--color-hairline)] min-w-[28px] pl-2 pr-2 text-left">{labels.team}</th>
        <th className="text-center">{labels.p}</th>
        <th className="text-center">{labels.w}</th>
        <th className="text-center">{labels.d}</th>
        <th className="text-center">{labels.l}</th>
        <th className="text-center">{labels.gf}</th>
        <th className="text-center">{labels.ga}</th>
        <th className="text-center">{labels.gd}</th>
        <th className="text-center font-semibold sticky right-0 z-20 bg-[var(--color-canvas-soft)] shadow-[-2px_0_0_var(--color-hairline)]">{labels.pts}</th>
      </tr>
    </thead>
  );
}

function GroupCard({
  group,
  teams,
  table,
}: {
  group: GroupStanding;
  teams: TeamStanding[];
  table: Record<string, string>;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) setIsScrolled(el.scrollLeft > 6);
  };

  return (
    <div className="card-marketing flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="display-sm tracking-[-0.5px]">Group {group.group}</h3>
        <span className="caption-mono text-[var(--color-mute)]">
          {teams.filter((t) => t.played > 0).length}/3 MD
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto isolate"
      >
        <table className="data-table w-full">
          <TableHeader labels={table} />
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-[var(--color-mute)] py-6">
                  —
                </td>
              </tr>
            ) : (
              teams.map((t, idx) => {
                const isQualified = !!t.qualified;
                const trClass = !isQualified
                  ? ""
                  : idx < 2
                    ? "bg-[var(--color-wc-gold-soft)]/35"
                    : "bg-[var(--color-wc-gold-soft)]/15";
                const stickyBg = isQualified
                  ? "bg-[var(--color-wc-gold-soft)]"
                  : "bg-[var(--color-canvas-soft)]";
                const middleTint = isQualified
                  ? (idx < 2 ? "bg-[var(--color-wc-gold-soft)]/35" : "bg-[var(--color-wc-gold-soft)]/15")
                  : "";
                return (
                  <tr key={t.team} className={trClass}>
                    <td className={`text-right tabular-nums text-[var(--color-mute)] w-7 pl-2 pr-1 sticky left-0 z-20 ${stickyBg}`}>{idx + 1}</td>
                    <td className={`sticky left-7 z-20 ${stickyBg} shadow-[2px_0_0_var(--color-hairline)] min-w-[28px] pl-2 pr-2`}>
                      <div className="flex items-center min-w-0">
                        <span className="text-base leading-none flex-shrink-0 mr-1.5">{t.flag}</span>
                        <span
                          className={`truncate font-medium transition-all duration-150 ${isScrolled ? "w-0 opacity-0 overflow-hidden" : "opacity-100"}`}
                        >
                          {t.team}
                        </span>
                      </div>
                    </td>
                    <td className={`text-center tabular-nums ${middleTint}`}>{t.played}</td>
                    <td className={`text-center tabular-nums ${middleTint}`}>{t.won}</td>
                    <td className={`text-center tabular-nums ${middleTint}`}>{t.draw}</td>
                    <td className={`text-center tabular-nums ${middleTint}`}>{t.loss}</td>
                    <td className={`text-center tabular-nums ${middleTint}`}>{t.goalsFor}</td>
                    <td className={`text-center tabular-nums ${middleTint}`}>{t.goalsAgainst}</td>
                    <td className={`text-center tabular-nums ${middleTint} ${t.goalDifference > 0 ? "text-[var(--color-success)]" : t.goalDifference < 0 ? "text-[var(--color-error)]" : "text-[var(--color-mute)]"}`}>
                      {t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}
                    </td>
                    <td className={`text-center tabular-nums font-semibold sticky right-0 z-20 ${stickyBg} shadow-[-2px_0_0_var(--color-hairline)]`}>{t.points}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KnockoutMatchCard({
  match,
  userTz,
  locale,
}: {
  match: Match;
  userTz: string;
  locale: string;
}) {
  const t = useTranslations("standings");
  const finished = isFinished(match.datetime, userTz);
  const live = isLive(match.datetime, userTz);
  const weekday = getWeekdayShort(match.datetime, locale, userTz);
  const dateStr = formatShortDate(match.datetime, locale, userTz);
  const timeStr = formatTimeLocal(match.datetime, userTz);

  const scoreA = match.score?.ft?.[0];
  const scoreB = match.score?.ft?.[1];
  const hasScore = scoreA !== undefined && scoreB !== undefined;

  const scorePenA = match.score?.p?.[0];
  const scorePenB = match.score?.p?.[1];
  const hasPen = scorePenA !== undefined && scorePenB !== undefined;

  return (
    <div
      className={`card-marketing flex flex-col justify-between p-4 relative overflow-hidden transition-all duration-200 ${
        live ? "ring-2 ring-[var(--color-live,#ef4444)] border-[var(--color-live,#ef4444)] shadow-md" : ""
      } ${finished ? "opacity-90" : ""}`}
    >
      {/* Top info bar */}
      <div className="flex items-center justify-between mb-4 text-[11px] font-mono text-[var(--color-mute)] border-b border-[var(--color-hairline)] pb-2">
        <span className="truncate max-w-[200px] uppercase tracking-wider">
          {match.venue}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {live ? (
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-live-bg,#fef2f2)] border border-[var(--color-live,#ef4444)]/30 text-[9px] font-bold text-[var(--color-live,#ef4444)] animate-pulse">
              LIVE
            </span>
          ) : finished ? (
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] text-[9px]">
              FT
            </span>
          ) : (
            <span className="tabular-nums">
              {weekday} {dateStr} • {timeStr}
            </span>
          )}
        </div>
      </div>

      {/* Symmetrical Match Display */}
      <div className="flex items-start justify-between gap-2 my-2 min-h-[92px]">
        {/* Team A (Left) */}
        <div className="flex flex-col items-center text-center sm:items-end sm:text-right flex-1 min-w-0">
          <span className="text-3xl sm:text-4xl leading-none mb-1.5 filter drop-shadow-sm select-none" aria-hidden>
            {getFlag(match.teamA)}
          </span>
          <span className="font-bold text-sm sm:text-base text-[var(--color-ink)] truncate w-full">
            {match.teamA}
          </span>
          {match.goalsA && match.goalsA.length > 0 && (
            <div className="text-[10px] sm:text-[11px] text-[var(--color-mute)] mt-1.5 flex flex-col gap-0.5 max-w-full">
              {match.goalsA.map((g, idx) => (
                <span key={idx} className="truncate w-full block" title={`${g.name} ${g.minute}'`}>
                  {g.name} {g.minute}'{g.penalty && " (P)"}{g.owngoal && " (OG)"} ⚽
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Center: Scores and VS */}
        <div className="flex flex-col items-center justify-center px-2 sm:px-4 shrink-0 select-none pt-1">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {hasScore ? (
              <>
                <span className="text-xl sm:text-2xl font-mono font-bold tabular-nums text-[var(--color-ink)]">
                  {scoreA}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider px-1">
                  vs
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold tabular-nums text-[var(--color-ink)]">
                  {scoreB}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-[var(--color-mute)] uppercase tracking-widest bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] px-2.5 py-0.5 rounded-md">
                vs
              </span>
            )}
          </div>
          {hasPen && (
            <span className="text-[9px] font-mono text-[var(--color-wc-gold)] font-medium mt-1.5 whitespace-nowrap bg-[var(--color-wc-gold-soft)]/20 px-2 py-0.5 rounded-full border border-[var(--color-wc-gold)]/20 animate-fade-in">
              ({scorePenA} - {scorePenB} pen)
            </span>
          )}
        </div>

        {/* Team B (Right) */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left flex-1 min-w-0">
          <span className="text-3xl sm:text-4xl leading-none mb-1.5 filter drop-shadow-sm select-none" aria-hidden>
            {getFlag(match.teamB)}
          </span>
          <span className="font-bold text-sm sm:text-base text-[var(--color-ink)] truncate w-full">
            {match.teamB}
          </span>
          {match.goalsB && match.goalsB.length > 0 && (
            <div className="text-[10px] sm:text-[11px] text-[var(--color-mute)] mt-1.5 flex flex-col gap-0.5 max-w-full">
              {match.goalsB.map((g, idx) => (
                <span key={idx} className="truncate w-full block" title={`${g.name} ${g.minute}'`}>
                  ⚽ {g.name} {g.minute}'{g.penalty && " (P)"}{g.owngoal && " (OG)"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StandingsClient() {
  const t = useTranslations();
  const locale = useLocale();

  const [groups, setGroups] = useState<GroupStanding[]>([]);
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"groups" | "knockout">("groups");
  const [knockoutRound, setKnockoutRound] = useState<
    "round-of-32" | "round-of-16" | "quarter-final" | "semi-final" | "finals"
  >("round-of-32");

  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTz, setUserTz] = useState("UTC");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setUserTz(getUserTimezone());

    // Kiểm tra nếu vòng bảng đã kết thúc (vòng bảng kết thúc ngày 27/06, vòng 32 bắt đầu ngày 28/06)
    const isGroupStageOver = new Date() > new Date("2026-06-28T00:00:00Z");
    if (isGroupStageOver) {
      setActiveTab("knockout");
    }
  }, []);

  const fetchData = useCallback(
    async (mode: "initial" | "manual" | "poll" = "poll") => {
      if (mode === "initial") setLoading(true);
      else if (mode === "manual") setRefreshing(true);

      try {
        const res = await fetch("/api/standings", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiPayload = await res.json();
        if (data.error) throw new Error(data.error);
        setGroups(data.groups || []);
        setKnockoutMatches(data.knockoutMatches || []);
        setUpdatedAt(data.updatedAt || new Date().toISOString());
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData("initial");

    function startPolling() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (!document.hidden) fetchData("poll");
      }, POLL_INTERVAL_MS);
    }

    function stopPolling() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    startPolling();

    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchData("poll");
        startPolling();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData]);

  const tableLabels = (key: string) => t(`standings.table.${key}` as any);

  const table = {
    rank: tableLabels("rank"),
    team: tableLabels("team"),
    p: tableLabels("p"),
    w: tableLabels("w"),
    d: tableLabels("d"),
    l: tableLabels("l"),
    gf: tableLabels("gf"),
    ga: tableLabels("ga"),
    gd: tableLabels("gd"),
    pts: tableLabels("pts"),
  };

  const knockoutRounds: { key: typeof knockoutRound; label: string }[] = [
    { key: "round-of-32", label: t("schedule.stage.round-of-32") },
    { key: "round-of-16", label: t("schedule.stage.round-of-16") },
    { key: "quarter-final", label: t("schedule.stage.quarter-final") },
    { key: "semi-final", label: t("schedule.stage.semi-final") },
    { key: "finals", label: `${t("schedule.stage.final")} & ${t("schedule.stage.third-place")}` },
  ];

  const filteredKnockoutMatches = knockoutMatches.filter((m) => {
    if (knockoutRound === "finals") {
      return m.stage === "final" || m.stage === "third-place";
    }
    return m.stage === knockoutRound;
  });

  if (error && groups.length === 0) {
    return (
      <div className="card-marketing text-center py-12">
        <div className="text-[var(--color-error)] font-medium mb-2">{t("standings.errorTitle")}</div>
        <div className="caption text-[var(--color-mute)] mb-4">{error}</div>
        <button onClick={() => fetchData("manual")} className="button-secondary-sm">
          {t("standings.retry")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header with Dynamic Title & Description */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div className="max-w-[720px]">
          <div className="caption-mono text-[var(--color-wc-gold)] mb-2">
            {t("standings.headerBadge")}
          </div>
          <h2 className="display-md mb-2">
            {activeTab === "groups" ? t("standings.title") : t("standings.knockoutTitle")}
          </h2>
          <p className="body-md text-[var(--color-body)]">
            {activeTab === "groups" ? t("standings.description") : t("standings.knockoutDescription")}
          </p>
        </div>

        {/* Dynamic Segment Switcher */}
        <div className="inline-flex p-0.5 rounded-lg bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] self-start md:self-auto shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 ${
              activeTab === "groups"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-xs border border-[var(--color-hairline)]"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)] border border-transparent"
            }`}
          >
            {t("standings.viewGroups")}
          </button>
          <button
            onClick={() => setActiveTab("knockout")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 ${
              activeTab === "knockout"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-xs border border-[var(--color-hairline)]"
                : "text-[var(--color-mute)] hover:text-[var(--color-ink)] border border-transparent"
            }`}
          >
            {t("standings.viewKnockout")}
          </button>
        </div>
      </div>

      {/* Control bar (Last updated & Refresh) */}
      <div className="flex flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--color-hairline)] border-dashed w-full">
        <div className="flex items-center gap-2 text-sm text-[var(--color-mute)] min-w-0">
          <span
            className={`inline-block w-2 h-2 rounded-full shrink-0 ${refreshing ? "bg-[var(--color-wc-gold)] animate-pulse" : "bg-[var(--color-success)]"}`}
            aria-hidden
          />
          <span className="tabular-nums font-mono text-[13px] truncate">
            {t("standings.lastUpdated", { time: formatTime(updatedAt, locale) })}
          </span>
        </div>

        <button
          onClick={() => fetchData("manual")}
          disabled={refreshing}
          className="button-secondary-sm disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0 ml-auto"
        >
          {refreshing ? (
            <>
              <svg className="animate-spin h-3 w-3 text-current" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t("standings.refreshing")}
            </>
          ) : (
            t("standings.refresh")
          )}
        </button>
      </div>

      {loading && groups.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card-marketing h-64 animate-pulse" />
          ))}
        </div>
      ) : activeTab === "groups" ? (
        /* ================= GROUP STANDINGS VIEW ================= */
        <div>
          {groups.length === 0 ? (
            <div className="card-marketing text-center py-12 text-[var(--color-mute)]">
              {t("standings.noData")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groups.map((g) => (
                <GroupCard
                  key={g.group}
                  group={g}
                  teams={g.teams}
                  table={table}
                />
              ))}
            </div>
          )}

          <p className="caption mt-6 text-[var(--color-mute)]">
            {t("standings.qualifyNote")}
          </p>
        </div>
      ) : (
        /* ================= KNOCKOUT MATCHES VIEW ================= */
        <div>
          {/* Sub-tabs for each knockout round */}
          <div className="flex flex-wrap gap-2 mb-6">
            {knockoutRounds.map((r) => (
              <button
                key={r.key}
                onClick={() => setKnockoutRound(r.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 ${
                  knockoutRound === r.key
                    ? "bg-[var(--color-wc-gold-soft)] border-[var(--color-wc-gold)] text-[var(--color-ink)] shadow-2xs font-semibold"
                    : "bg-[var(--color-canvas)] border-[var(--color-hairline)] text-[var(--color-mute)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {filteredKnockoutMatches.length === 0 ? (
            <div className="card-marketing text-center py-12 text-[var(--color-mute)]">
              {t("standings.noKnockoutMatches")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredKnockoutMatches.map((match) => (
                <KnockoutMatchCard
                  key={match.id}
                  match={match}
                  userTz={userTz}
                  locale={locale}
                />
              ))}
            </div>
          )}

          <p className="caption mt-6 text-[var(--color-mute)]">
            {t("addToCalendarPage.description")}
          </p>
        </div>
      )}
    </div>
  );
}
