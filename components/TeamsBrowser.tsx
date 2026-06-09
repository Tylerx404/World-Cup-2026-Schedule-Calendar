"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { normalizeTeamName, type TeamInfo, type Player } from "@/data/teams/index";
import type { Match } from "@/data/schedule";
import { getFlag } from "@/lib/flags";
import { staggerContainer, fadeInUp, modalVariants, backdropVariants, useSafeMotion } from "@/lib/motion";

interface TeamsBrowserProps {
  teams: Array<TeamInfo & { present?: boolean }>;
  allMatches?: Match[];
}

export function TeamsBrowser({ teams, allMatches }: TeamsBrowserProps) {
  const t = useTranslations();
  const [selected, setSelected] = useState<(TeamInfo & { present?: boolean }) | null>(null);

  const sorted = Array.from(
    new Map(
      teams.map((t) => [normalizeTeamName(t.name), t] as const)
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const { shouldReduce } = useSafeMotion();

  useEffect(() => {
    if (!selected) return;

    const html = document.documentElement;
    const body = document.body;

    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [selected]);

  return (
    <>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        {...(!shouldReduce && {
          variants: staggerContainer(0.04) as any,
          initial: "hidden",
          animate: "visible",
        })}
      >
        {sorted.map((team) => {
          const stableKey = normalizeTeamName(team.name);
          return (
            <motion.button
              key={stableKey}
              onClick={() => setSelected(team)}
              {...(!shouldReduce && { variants: fadeInUp as any })}
              whileHover={shouldReduce ? undefined : { scale: 1.015 }}
              className="card-marketing text-left hover:border-[var(--color-link)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-link)]"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl sm:text-3xl leading-none mt-0.5 flex-shrink-0">{team.flag}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{team.name}</div>
                    {team.group && (
                      <span
                        className="px-1.5 rounded bg-[var(--color-canvas-soft)] text-[10px] font-mono text-[var(--color-mute)] flex-shrink-0"
                        title={t("schedule.groupLabel", { group: team.group })}
                      >
                        {team.group}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--color-mute)] flex items-center gap-1 mt-0.5 overflow-hidden">
                    {team.confederation && (
                      <span
                        className="px-1.5 rounded bg-[var(--color-canvas-soft)] truncate min-w-0"
                        title={team.confederation}
                      >
                        {team.confederation}
                      </span>
                    )}
                    {team.fifaRank && (
                      <span className="tabular-nums flex-shrink-0">#{team.fifaRank}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={() => setSelected(null)}
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
              {...(!shouldReduce && {
                variants: modalVariants as any,
                initial: "hidden",
                animate: "visible",
                exit: "exit",
              })}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-[var(--color-mute)] hover:text-[var(--color-ink)] text-xl leading-none"
                aria-label={t("teams.close")}
              >
                ×
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{selected.flag}</div>
                <div>
                  <div className="display-sm">{selected.name}</div>
                  <div className="text-sm text-[var(--color-body)]">
                    {selected.group ? `${t("schedule.groupLabel", { group: selected.group })} • ` : ""}
                    {selected.confederation || "World Cup 2026"}
                    {selected.fifaRank ? ` • FIFA #${selected.fifaRank}` : ""}
                  </div>
                </div>
              </div>

              <div className="body-md mb-4">{selected.description}</div>

              {selected.coach && (
                <div className="mb-4">
                  <div className="caption-mono text-[var(--color-mute)] mb-1">{t("teams.coach")}</div>
                  <div className="body-md-strong">{selected.coach}</div>
                </div>
              )}

{selected.keyPlayers && selected.keyPlayers.length > 0 && (
  <div className="mb-4">
    <div className="caption-mono text-[var(--color-mute)] mb-1.5">{t("teams.keyPlayers")}</div>
    <div className="flex flex-wrap gap-2">
      {selected.keyPlayers.map((p, i) => (
        <span key={i} className="px-3 py-1 rounded-full bg-[var(--color-canvas-soft)] text-sm border border-[var(--color-hairline)]">
          {p}
        </span>
      ))}
    </div>
  </div>
)}

{selected.squad && selected.squad.length > 0 && (
  <div className="mb-4">
    <div className="caption-mono text-[var(--color-mute)] mb-3">{t("teams.squad")}</div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {(["GK", "DF", "MF", "FW"] as const).map((pos) => {
        const players = selected.squad!.filter((p) => p.pos === pos);
        if (players.length === 0) return null;
        return (
          <div key={pos}>
            <div className="text-[10px] font-mono text-[var(--color-mute)] mb-1.5 uppercase tracking-wider">
              {pos}
            </div>
            <div className="space-y-1.5">
              {players.map((p, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-canvas-soft)] rounded-md px-2.5 py-2 border border-[var(--color-hairline)]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] tabular-nums text-[var(--color-mute)]">
                      #{p.number ?? "—"}
                    </span>
                    <span className="text-xs font-medium truncate">{p.name}</span>
                  </div>
                  <div className="text-[10px] text-[var(--color-body)] truncate mt-0.5">
                    {p.club}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}

{selected.homeStadiums && selected.homeStadiums.length > 0 && (
                <div>
                  <div className="caption-mono text-[var(--color-mute)] mb-1.5">{t("teams.homeStadiums")}</div>
                  <ul className="text-sm text-[var(--color-body)] space-y-1">
                    {selected.homeStadiums.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {allMatches && allMatches.length > 0 && (
                <div className="mt-5">
                  <div className="caption-mono text-[var(--color-mute)] mb-2">{t("teams.matchesOf", { team: selected.name.toUpperCase() })}</div>
                  <div className="space-y-1 text-sm max-h-48 overflow-auto pr-1">
                    {allMatches
                      .filter((m) => normalizeTeamName(m.teamA) === normalizeTeamName(selected.name) || normalizeTeamName(m.teamB) === normalizeTeamName(selected.name))
                      .sort((a, b) => a.datetime.localeCompare(b.datetime))
                      .slice(0, 6)
                      .map((m, i) => (
                        <div key={i} className="flex justify-between border-b border-[var(--color-hairline)] py-1">
                          <span>{m.datetime.split("T")[0]} — {getFlag(m.teamA)} {m.teamA} vs {getFlag(m.teamB)} {m.teamB}</span>
                          <span className="text-[var(--color-mute)] text-xs">{m.venue}</span>
                        </div>
                      ))}
                    {allMatches.filter((m) => normalizeTeamName(m.teamA) === normalizeTeamName(selected.name) || normalizeTeamName(m.teamB) === normalizeTeamName(selected.name)).length === 0 && (
                      <div className="text-[var(--color-mute)] text-xs">{t("teams.noSchedule")}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[var(--color-hairline)] text-xs text-[var(--color-mute)]">
                {t("teams.infoNote")}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
