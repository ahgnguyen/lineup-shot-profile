// frontend/src/api/composite.ts

const API_BASE_URL = "http://localhost:4000";

export interface CompositeCell {
  x: number;
  y: number;
  frequency: number;
  pointsPerShot: number;
}

export async function getComposite(playerIds: number[]): Promise<CompositeCell[]> {
  const response = await fetch(`${API_BASE_URL}/composite?playerIds=${playerIds.join(",")}`);
  return response.json();
}
