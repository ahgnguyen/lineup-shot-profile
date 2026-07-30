// frontend/src/api/teams.ts

import { apiGet } from "./client";

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
}

export interface TeamPlayer {
  id: number;
  name: string;
}

export function getTeams(): Promise<Team[]> {
  return apiGet<Team[]>("/teams");
}

export function getTeamPlayers(teamId: number): Promise<TeamPlayer[]> {
  return apiGet<TeamPlayer[]>(`/teams/${teamId}/players`);
}
