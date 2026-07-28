// backend/src/model/composite.ts

import { binShots, type ShotPoint } from "./hexbin";

export interface PlayerShotData {
  playerId: number;
  shots: ShotPoint[];
  fgaShare: number;
}

export interface CompositeCell {
  x: number;
  y: number;
  frequency: number;
  pointsPerShot: number;
}

export function computeComposite(players: PlayerShotData[]): CompositeCell[] {
  const lineupTotalShare = players.reduce((sum, p) => sum + p.fgaShare, 0);

  const weights = new Map(
    players.map((p) => [p.playerId, p.fgaShare / lineupTotalShare]),
  );

  const cellFrequency = new Map<string, number>();
  const cellPointsPerShotSum = new Map<string, number>();
  const cellCenters = new Map<string, { x: number; y: number }>();

  for (const player of players) {
    const bins = binShots(player.shots);
    const weight = weights.get(player.playerId)!;
    const totalShots = player.shots.length;

    for (const bin of bins) {
      const key = `${bin.x},${bin.y}`;

      const pointsInBin = bin.reduce((sum, shot) => sum + shot.points, 0);
      const freqContribution = weight * (bin.length / totalShots);
      const pointsPerShotContribution = (weight * pointsInBin) / totalShots;

      cellFrequency.set(key, (cellFrequency.get(key) ?? 0) + freqContribution);
      cellPointsPerShotSum.set(
        key,
        (cellPointsPerShotSum.get(key) ?? 0) + pointsPerShotContribution,
      );
      cellCenters.set(key, { x: bin.x, y: bin.y });
    }
  }

  return Array.from(cellFrequency.entries()).map(([key, frequency]) => ({
    ...cellCenters.get(key)!,
    frequency,
    pointsPerShot: cellPointsPerShotSum.get(key)! / frequency,
  }));
}
