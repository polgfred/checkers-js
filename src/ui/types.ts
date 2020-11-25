import { MoveType, PieceType } from '../core/types';

export type Coords = { x: number; y: number };

// web worker

export type WorkerData = { data: { move: MoveType } };

// drag and drop

export type DragItem = {
  type: 'piece';
  p: PieceType;
} & Coords;

export type DropResult = Coords;
