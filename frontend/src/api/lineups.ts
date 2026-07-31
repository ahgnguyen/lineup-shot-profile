// frontend/src/api/lineups.ts

import type { CompositeCell } from './composite'
import { apiGet } from './client'
import type { ZoneId } from '../court/zones'

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

export interface ActualZoneSummary {
  zoneId: ZoneId;
  shots: number;
  frequency: number;
  pointsPerShot: number | null;
}

export interface LineupActualResponse {
  cells: CompositeCell[];
  zones: ActualZoneSummary[];
  totalShots: number;
}

export function getTeamLineups(teamId: number): Promise<TeamLineup[]> {
  return apiGet<TeamLineup[]>(`/teams/${teamId}/lineups`);
}

export function getLineupActual(lineupId: string): Promise<LineupActualResponse> {
  return apiGet<LineupActualResponse>(`/lineups/${encodeURIComponent(lineupId)}/actual`);
}
