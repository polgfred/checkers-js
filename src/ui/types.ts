import type { PieceType } from '../core/types';

export interface Coords {
  x: number;
  y: number;
}

export interface PieceAtCoords extends Coords {
  p: PieceType;
}
