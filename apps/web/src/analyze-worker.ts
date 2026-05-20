import { analyze, type BoardType, type SideType } from '@checkers/core';

type AnalyzeRequest = {
  id: number;
  board: BoardType;
  side: SideType;
};

declare const self: Worker;

self.addEventListener(
  'message',
  (ev: MessageEvent<AnalyzeRequest>) => {
    const { id, board, side } = ev.data;
    const [, move] = analyze(board, side);
    self.postMessage({ id, move: move ?? null });
  },
  false
);
