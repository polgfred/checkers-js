import type { PieceType } from '@checkers/core';

export interface Coords {
  x: number;
  y: number;
}

export interface PieceAtCoords extends Coords {
  p: PieceType;
}
