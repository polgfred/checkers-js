export enum SideType {
  RED = 1,
  WHT = -1,
}

export enum PieceType {
  EMPTY = 0,
  RED_PIECE = 1,
  RED_KING = 2,
  RED_EITHER = 3,
  WHT_PIECE = -1,
  WHT_KING = -2,
  WHT_EITHER = -3,
}

type RowType = [
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
  PieceType,
];

export type BoardType = readonly [
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
  RowType,
];

export type SegmentType =
  | readonly [number, number]
  | readonly [number, number, number, number];

export type MoveType = readonly SegmentType[];
export type _MutableMoveType = SegmentType[]; // used internally to build up moves

export interface TreeType {
  [key: string]: TreeType;
}

export type FormationType = readonly [number, number, PieceType][];
export type ScoresType = readonly [FormationType, number][][][];
