import React, { useCallback, useEffect } from 'react';

import { copyBoard } from '../core/utils';

import Board from './board';

// create a worker once that we'll attach to as needed
const worker = new Worker('./worker-bundle.js');

const isFalse = () => false;

export default function AIPlayer({ board, side, moveComplete }) {
  const onComplete = useCallback(({ data: { move } }) => {
    const len = move.length;
    const [x, y] = move[0];
    const [fx, fy] = move[len - 1];
    const p = board[y][x];
    const top = side == 1 ? 7 : 0;
    const crowned = p == side && fy == top;

    // remove the initial piece
    board[y][x] = 0;

    for (let i = 1; i < len; ++i) {
      if (move[i].length > 2) {
        const [, , mx, my] = move[i];

        // perform the jump
        board[my][mx] = 0;
      }
    }

    // final piece
    board[fy][fx] = crowned ? p * 2 : p;

    // commit this position
    moveComplete(board, move);
  });

  useEffect(() => {
    worker.addEventListener('message', onComplete, false);
    worker.postMessage({ board, side });
    return () => {
      worker.removeEventListener('message', onComplete, false);
    };
  }, [onComplete]);

  return (
    <Board
      board={board}
      side={side}
      canDrag={isFalse}
      canDrop={isFalse}
      endDrag={isFalse}
    />
  );
}
