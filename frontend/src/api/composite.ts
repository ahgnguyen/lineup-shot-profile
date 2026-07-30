// frontend/src/api/composite.ts

import { apiGet } from "./client";

export interface CompositeCell {
  x: number;
  y: number;
  frequency: number;
  pointsPerShot: number;
}

export interface CompositePlayerSummary {
  playerId: number;
  shotCount: number;
  fgaShare: number;
  weight: number;
}

export interface CompositeResponse {
  cells: CompositeCell[];
  totalShots: number;
  players: CompositePlayerSummary[];
}

export function getComposite(playerIds: number[]): Promise<CompositeResponse> {
  return apiGet<CompositeResponse>(`/composite?playerIds=${playerIds.join(",")}`);
}
