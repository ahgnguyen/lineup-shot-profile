// frontend/src/api/players.ts

import { apiGet } from "./client";

export interface Shot {
  loc_x: number;
  loc_y: number;
  made: boolean;
}

export interface Player {
  id: number;
  name: string;
}

export function getPlayerShots(playerId: number): Promise<Shot[]> {
  return apiGet<Shot[]>(`/players/${playerId}/shots`);
}

export function getPlayer(playerId: number): Promise<Player> {
  return apiGet<Player>(`/players/${playerId}`);
}
