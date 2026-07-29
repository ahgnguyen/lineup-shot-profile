// frontend/src/api/composite.ts

const API_BASE_URL = "http://localhost:4000";

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

export async function getComposite(playerIds: number[]): Promise<CompositeResponse> {
  const response = await fetch(`${API_BASE_URL}/composite?playerIds=${playerIds.join(",")}`);
  return response.json();
}
