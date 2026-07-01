import {
  analyze,
  copyBoard,
  makeDefaultEvaluator,
  type BoardType,
  type SideType,
} from '@checkers/core';

type AnalyzeRequest = {
  board: BoardType;
  side: SideType;
  maxDepth?: number;
};

declare const self: Worker;

const evaluator = makeDefaultEvaluator();

self.addEventListener(
  'message',
  (ev: MessageEvent<AnalyzeRequest>) => {
    const { board, side, maxDepth } = ev.data;
    // re-pack arrays after structured cloning
    const board2 = copyBoard(board);
    const [, move] = analyze(board2, side, maxDepth, evaluator);
    self.postMessage({ move: move ?? null });
  },
  false
);
