// backend/src/model/composite.ts

import { binShots, type ShotPoint } from "./hexbin";
import { classifyZone, ZONE_IDS, type ZoneId } from "./zones";

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

export interface CompositeResult {
  cells: CompositeCell[];
  weights: Map<number, number>;
}

export function computeComposite(players: PlayerShotData[]): CompositeResult {
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

  const cells = Array.from(cellFrequency.entries()).map(([key, frequency]) => ({
    ...cellCenters.get(key)!,
    frequency,
    pointsPerShot: cellPointsPerShotSum.get(key)! / frequency,
  }));

  return { cells, weights };
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

export function computeZoneBreakdown(
  players: PlayerShotData[],
  weights: Map<number, number>,
): ZoneBreakdown[] {
  return ZONE_IDS.map((zoneId) => {
    const perPlayer = players.map((player) => {
      const weight = weights.get(player.playerId) ?? 0;
      const totalShots = player.shots.length;
      const zoneShots = player.shots.filter((s) => classifyZone(s.x, s.y) === zoneId);
      const freqContribution = totalShots > 0 ? weight * (zoneShots.length / totalShots) : 0;
      const pointsInZone = zoneShots.reduce((sum, s) => sum + s.points, 0);
      const pointsPerShot = zoneShots.length > 0 ? pointsInZone / zoneShots.length : null;
      return { playerId: player.playerId, shots: zoneShots.length, freqContribution, pointsPerShot };
    });

    const frequency = perPlayer.reduce((sum, p) => sum + p.freqContribution, 0);
    const pointsPerShot =
      frequency > 0
        ? perPlayer.reduce((sum, p) => sum + p.freqContribution * (p.pointsPerShot ?? 0), 0) / frequency
        : null;

    return {
      zoneId,
      frequency,
      pointsPerShot,
      players: perPlayer.map((p) => ({
        playerId: p.playerId,
        shots: p.shots,
        freqShare: frequency > 0 ? p.freqContribution / frequency : 0,
        pointsPerShot: p.pointsPerShot,
      })),
    };
  });
}

export interface ActualZoneSummary {
  zoneId: ZoneId;
  shots: number;
  frequency: number;
  pointsPerShot: number | null;
}

export function computeActualZones(shots: ShotPoint[]): ActualZoneSummary[] {
  const totalShots = shots.length;

  return ZONE_IDS.map((zoneId) => {
    const zoneShots = shots.filter((s) => classifyZone(s.x, s.y) === zoneId);
    const pointsInZone = zoneShots.reduce((sum, s) => sum + s.points, 0);
    return {
      zoneId,
      shots: zoneShots.length,
      frequency: totalShots > 0 ? zoneShots.length / totalShots : 0,
      pointsPerShot: zoneShots.length > 0 ? pointsInZone / zoneShots.length : null,
    };
  });
}

export function computeActual(shots: ShotPoint[]): CompositeCell[] {
  const bins = binShots(shots);
  const totalShots = shots.length;

  return bins.map((bin) => {
    const pointsInBin = bin.reduce((sum, shot) => sum + shot.points, 0);
    return {
      x: bin.x,
      y: bin.y,
      frequency: bin.length / totalShots,
      pointsPerShot: pointsInBin / bin.length,
    };
  });
}
