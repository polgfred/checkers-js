import {
  analyze,
  copyBoard,
  type BoardType,
  type SideType,
} from '@checkers/core';

type AnalyzeRequest = {
  board: BoardType;
  side: SideType;
};

declare const self: Worker;

self.addEventListener(
  'message',
  (ev: MessageEvent<AnalyzeRequest>) => {
    const { board, side } = ev.data;
    // re-pack arrays after structured cloning
    const board2 = copyBoard(board);
    const [, move] = analyze(board2, side);
    self.postMessage({ move: move ?? null });
  },
  false
);
