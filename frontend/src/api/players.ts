// frontend/src/api/players.ts

const API_BASE_URL = "http://localhost:4000";

export interface Shot {
  loc_x: number;
  loc_y: number;
  made: boolean;
}

export interface Player {
  id: number;
  name: string;
}

export async function getPlayerShots(playerId: number): Promise<Shot[]> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/shots`);
  return response.json();
}

export async function getPlayer(playerId: number): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}`);
  return response.json();
}

export interface PlayerSearchResult {
  id: number;
  name: string;
  team_abbreviation: string;
}

export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/players?q=${encodeURIComponent(query)}`);
  return response.json();
}
