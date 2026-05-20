import { analyze, type BoardType, type SideType } from '@checkers/core';

type AnalyzeRequest = {
  board: BoardType;
  side: SideType;
};

declare const self: Worker;

self.addEventListener(
  'message',
  (ev: MessageEvent<AnalyzeRequest>) => {
    const { board, side } = ev.data;
    const [, move] = analyze(board, side);
    self.postMessage({ move: move ?? null });
  },
  false
);
