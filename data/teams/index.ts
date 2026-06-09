import { teams as baseTeams, type TeamInfo as BaseTeamInfo } from "./base";
import { squads } from "./squads";

const teams: Record<string, BaseTeamInfo> = Object.fromEntries(
  Object.entries(baseTeams).map(([key, team]) => [
    key,
    {
      ...team,
      squad: squads[key] ?? team.squad ?? [],
    },
  ])
);

export { teams, squads };

const ALIASES: Record<string, string> = {
  "South Korea": "Korea Republic",
  USA: "United States",
  "Ivory Coast": "Côte d'Ivoire",
  "Cote d'Ivoire": "Côte d'Ivoire",
  "Bosnia & Herzegovina": "Bosnia and Herzegovina",
  "Czech Republic": "Czechia",
  Türkiye: "Turkey",
  "IR Iran": "Iran",
  "Cabo Verde": "Cape Verde",
  "Congo DR": "DR Congo",
  "Democratic Republic of the Congo": "DR Congo",
};

export function normalizeTeamName(name: string): string {
  return ALIASES[name] || name;
}

export function getTeamInfo(name: string): BaseTeamInfo | null {
  const key = normalizeTeamName(name);
  return teams[key] || null;
}

export function getAllTeams(): BaseTeamInfo[] {
  return Object.values(teams);
}

export type { Player } from "./squads";
export type { TeamInfo } from "./base";
