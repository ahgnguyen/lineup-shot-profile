// backend/src/model/hexbin.ts

import { hexbin as d3Hexbin } from "d3-hexbin";

export const HEX_RADIUS = 20;

export const EXTENT: [[number, number], [number, number]] = [
  [-250, -50],
  [250, 420],
];

export interface ShotPoint {
  x: number;
  y: number;
  points: number; // 0 if missed, 2 or 3 if made
}

export function binShots(shots: ShotPoint[]) {
  const hexbin = d3Hexbin<ShotPoint>()
    .radius(HEX_RADIUS)
    .extent(EXTENT)
    .x((d) => d.x)
    .y((d) => d.y);

  return hexbin(shots);
}
