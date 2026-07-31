// frontend/src/api/composite.ts

import { apiGet } from "./client";
import type { ZoneId } from "../court/zones";

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

export interface ZonePlayerBreakdown {
  playerId: number;
  shots: number;
  freqShare: number;
  pointsPerShot: number | null;
}

export interface ZoneBreakdown {
  zoneId: ZoneId;
  frequency: number;
  pointsPerShot: number | null;
  players: ZonePlayerBreakdown[];
}

export interface CompositeResponse {
  cells: CompositeCell[];
  zones: ZoneBreakdown[];
  totalShots: number;
  players: CompositePlayerSummary[];
}

export function getComposite(playerIds: number[]): Promise<CompositeResponse> {
  return apiGet<CompositeResponse>(`/composite?playerIds=${playerIds.join(",")}`);
}
