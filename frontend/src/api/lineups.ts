// frontend/src/api/lineups.ts

import type { CompositeCell } from './composite'
import { apiGet } from './client'

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

export function getTeamLineups(teamId: number): Promise<TeamLineup[]> {
  return apiGet<TeamLineup[]>(`/teams/${teamId}/lineups`);
}

export function getLineupActual(lineupId: string): Promise<LineupActualResponse> {
  return apiGet<LineupActualResponse>(`/lineups/${encodeURIComponent(lineupId)}/actual`);
}
