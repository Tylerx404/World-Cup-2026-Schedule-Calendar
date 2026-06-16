import { getAllTeams } from "./teams/index";

const teamToGroup: Record<string, string> = Object.fromEntries(
  getAllTeams()
    .filter((t: { group?: string }) => Boolean(t.group))
    .map((t: { name: string; group?: string }) => [t.name, t.group as string])
);

export const TEAM_TO_GROUP: Record<string, string> = teamToGroup;
