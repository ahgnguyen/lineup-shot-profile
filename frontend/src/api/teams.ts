// frontend/src/api/teams.ts

const API_BASE_URL = "http://localhost:4000";

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
}

export interface TeamPlayer {
  id: number;
  name: string;
}

export async function getTeams(): Promise<Team[]> {
  const response = await fetch(`${API_BASE_URL}/teams`);
  return response.json();
}

export async function getTeamPlayers(teamId: number): Promise<TeamPlayer[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/players`);
  return response.json();
}
