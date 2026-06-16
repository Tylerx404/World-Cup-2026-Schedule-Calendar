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
        <th className="text-center w-8">{labels.rank}</th>
        <th>{labels.team}</th>
        <th className="text-center">{labels.p}</th>
        <th className="text-center">{labels.w}</th>
        <th className="text-center">{labels.d}</th>
        <th className="text-center">{labels.l}</th>
        <th className="text-center">{labels.gf}</th>
        <th className="text-center">{labels.ga}</th>
        <th className="text-center">{labels.gd}</th>
        <th className="text-center font-semibold">{labels.pts}</th>
      </tr>
    </thead>
  );
}

function GroupCard({
  group,
  teams,
  table,
  qualified,
}: {
  group: GroupStanding;
  teams: TeamStanding[];
  table: Record<string, string>;
  qualified: string;
}) {
  return (
    <div className="card-marketing flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="caption-mono text-[var(--color-wc-gold)]">{qualified}</span>
          <h3 className="display-sm tracking-[-0.5px]">
            Group {group.group}
          </h3>
        </div>
        <span className="caption-mono text-[var(--color-mute)]">
          {teams.filter((t) => t.played > 0).length}/3 MD
        </span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
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
                const qualified = idx < 2;
                return (
                  <tr key={t.team} className={qualified ? "bg-[var(--color-wc-gold-soft)]/30" : ""}>
                    <td className="text-center tabular-nums text-[var(--color-mute)]">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none flex-shrink-0">{t.flag}</span>
                        <span className="truncate font-medium">{t.team}</span>
                      </div>
                    </td>
                    <td className="text-center tabular-nums">{t.played}</td>
                    <td className="text-center tabular-nums">{t.won}</td>
                    <td className="text-center tabular-nums">{t.draw}</td>
                    <td className="text-center tabular-nums">{t.loss}</td>
                    <td className="text-center tabular-nums">{t.goalsFor}</td>
                    <td className="text-center tabular-nums">{t.goalsAgainst}</td>
                    <td className={`text-center tabular-nums ${t.goalDifference > 0 ? "text-[var(--color-success)]" : t.goalDifference < 0 ? "text-[var(--color-error)]" : "text-[var(--color-mute)]"}`}>
                      {t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}
                    </td>
                    <td className="text-center tabular-nums font-semibold">{t.points}</td>
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
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{t("autoUpdate")}</span>
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
              qualified={t("qualified")}
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
