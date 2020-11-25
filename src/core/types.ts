export type BoardType = Int8Array[];
export type SegmentType = [number, number] | [number, number, number, number];
export type MoveType = SegmentType[];
export type TreeType = { [key: string]: TreeType };
export type FormationType = [number, number, PieceType][];
export type ScoresType = [FormationType, number][][][];

export enum SideType {
  RED = 1,
  WHT = -1,
  WHITE = WHT,
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

export function isPieceOf(side: SideType, piece: PieceType): boolean {
  return (
    (side === SideType.RED && piece === PieceType.RED_PIECE) ||
    (side === SideType.WHT && piece === PieceType.WHT_PIECE)
  );
}

export function isKingOf(side: SideType, piece: PieceType): boolean {
  return (
    (side === SideType.RED && piece === PieceType.RED_KING) ||
    (side === SideType.WHT && piece === PieceType.WHT_KING)
  );
}
