import { getFlag } from "@/lib/flags";
import { normalizeTeamName } from "@/data/teams/index";
import { TEAM_TO_GROUP } from "@/data/standingsGroups";

export interface TeamStanding {
  team: string;
  flag: string;
  played: number;
  won: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStanding {
  group: string;
  teams: TeamStanding[];
}

interface RawScore {
  ft?: [number, number];
}

export interface RawMatchForStandings {
  group?: string;
  team1: string;
  team2: string;
  score?: RawScore;
}

const ALL_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function emptyRow(team: string): TeamStanding {
  return {
    team,
    flag: getFlag(team),
    played: 0,
    won: 0,
    draw: 0,
    loss: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function groupLetterFromMatch(rawGroup: string | undefined, team1: string, team2: string): string | null {
  if (rawGroup) {
    const stripped = rawGroup.replace(/^Group\s+/i, "").trim();
    if (ALL_GROUPS.includes(stripped)) return stripped;
  }
  return TEAM_TO_GROUP[normalizeTeamName(team1)] ?? null;
}

function compareTeams(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.localeCompare(b.team);
}

export function computeStandings(
  rawMatches: RawMatchForStandings[],
  groupAssignments: Record<string, string> = TEAM_TO_GROUP
): GroupStanding[] {
  const byGroup: Record<string, Map<string, TeamStanding>> = {};

  for (const letter of ALL_GROUPS) {
    byGroup[letter] = new Map();
    for (const [team, grp] of Object.entries(groupAssignments)) {
      if (grp === letter) {
        byGroup[letter].set(team, emptyRow(team));
      }
    }
  }

  for (const m of rawMatches) {
    if (!m.score?.ft) continue;

    const group = groupLetterFromMatch(m.group, m.team1, m.team2);
    if (!group) continue;

    const t1 = normalizeTeamName(m.team1);
    const t2 = normalizeTeamName(m.team2);
    if (!ALL_GROUPS.includes(group)) continue;

    const bucket = byGroup[group];
    if (!bucket.has(t1)) bucket.set(t1, emptyRow(t1));
    if (!bucket.has(t2)) bucket.set(t2, emptyRow(t2));

    const row1 = bucket.get(t1)!;
    const row2 = bucket.get(t2)!;

    const [s1, s2] = m.score.ft;

    row1.played += 1;
    row2.played += 1;
    row1.goalsFor += s1;
    row1.goalsAgainst += s2;
    row2.goalsFor += s2;
    row2.goalsAgainst += s1;

    if (s1 > s2) {
      row1.won += 1; row1.points += 3;
      row2.loss += 1;
    } else if (s1 < s2) {
      row2.won += 1; row2.points += 3;
      row1.loss += 1;
    } else {
      row1.draw += 1; row1.points += 1;
      row2.draw += 1; row2.points += 1;
    }
  }

  for (const row of Object.values(byGroup).flatMap((m) => Array.from(m.values()))) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }

  return ALL_GROUPS.map((letter) => {
    const teams = Array.from(byGroup[letter].values()).sort(compareTeams);
    return { group: letter, teams };
  });
}
