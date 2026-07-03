"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { GroupStanding, TeamStanding } from "@/lib/standings";

const POLL_INTERVAL_MS = 60_000;

interface ApiPayload {
  groups?: GroupStanding[];
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
                // Differentiate top-2 (stronger) vs qualifying 3rd-placed (subtle) highlight
                const trClass = !isQualified
                  ? ""
                  : idx < 2
                    ? "bg-[var(--color-wc-gold-soft)]/35"
                    : "bg-[var(--color-wc-gold-soft)]/15";
                // Solid background for sticky columns (covers scrolled content cleanly)
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
                        <span className="text-base leading-none flex-shrink-0">{t.flag}</span>
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

export function StandingsClient() {
  const t = useTranslations("standings");
  const locale = useLocale();

  const [groups, setGroups] = useState<GroupStanding[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const tableLabels = (key: string) => t(`table.${key}` as any);

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

  if (error && groups.length === 0) {
    return (
      <div className="card-marketing text-center py-12">
        <div className="text-[var(--color-error)] font-medium mb-2">{t("errorTitle")}</div>
        <div className="caption text-[var(--color-mute)] mb-4">{error}</div>
        <button onClick={() => fetchData("manual")} className="button-secondary-sm">
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-mute)]">
          <span
            className={`inline-block w-2 h-2 rounded-full ${refreshing ? "bg-[var(--color-wc-gold)] animate-pulse" : "bg-[var(--color-success)]"}`}
            aria-hidden
          />
          <span className="tabular-nums">
            {t("lastUpdated", { time: formatTime(updatedAt, locale) })}
          </span>
        </div>

        <button
          onClick={() => fetchData("manual")}
          disabled={refreshing}
          className="button-secondary-sm disabled:opacity-50"
        >
          {refreshing ? t("refreshing") : t("refresh")}
        </button>
      </div>

      {loading && groups.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card-marketing h-64 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card-marketing text-center py-12 text-[var(--color-mute)]">
          {t("noData")}
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
        {t("qualifyNote")}
      </p>
    </div>
  );
}
