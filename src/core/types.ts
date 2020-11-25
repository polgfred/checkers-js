export type BoardType = Int8Array[];
export type SegmentType = [number, number] | [number, number, number, number];
export type MoveType = SegmentType[];
export type TreeType = { [key: string]: TreeType };
export type FormationType = [number, number, PieceType][];
export type ScoresType = [FormationType, number][][][];

export const enum SideType {
  WHITE = 1,
  RED = -1,
}

export const enum PieceType {
  EMPTY = 0,
  WHITE_PIECE = 1,
  WHITE_KING = 2,
  WHITE_EITHER = 3,
  RED_PIECE = -1,
  RED_KING = -2,
  RED_EITHER = -3,
}
