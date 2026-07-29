// frontend/src/api/lineups.ts

import type { CompositeCell } from './composite'

const API_BASE_URL = "http://localhost:4000";

export interface TeamLineup {
  id: string;
  playerIds: number[];
  playerNames: string[];
  playerTeamIds: number[];
  playerTeamAbbreviations: string[];
  totalMinutes: number;
  totalFga: number;
  sufficientSample: boolean;
}

export interface LineupActualResponse {
  cells: CompositeCell[];
  totalShots: number;
}

export async function getTeamLineups(teamId: number): Promise<TeamLineup[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/lineups`);
  return response.json();
}

export async function getLineupActual(lineupId: string): Promise<LineupActualResponse> {
  const response = await fetch(`${API_BASE_URL}/lineups/${encodeURIComponent(lineupId)}/actual`);
  return response.json();
}
