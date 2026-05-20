import {
  analyze,
  type BoardType,
  type PlayType,
  type SideType,
} from '@checkers/core';

type AnalyzeJob = {
  board: BoardType;
  side: SideType;
  depth: number;
};

export default function runAnalyzeJob({
  board,
  side,
  depth,
}: AnalyzeJob): PlayType | null {
  const searchDepth = Math.max(1, Math.floor(depth));
  const [, move] = analyze(board, side, searchDepth);
  return move ?? null;
}
