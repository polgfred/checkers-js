import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Move } from '../core/rules';
import { Board } from './board';
import { GameContext } from './game_context';

// create a worker once that we'll attach to as needed
const worker = new Worker('./worker-bundle.js');

export function AIPlayer(): JSX.Element {
  const { getBoard, getSide, makeMove } = useContext(GameContext);
  const [{ board, side }] = useState({
    board: getBoard(),
    side: getSide(),
  });

  const onComplete = useCallback(
    ({ data: { move } }: { data: { move: Move } }) => {
      const len = move.length;
      const [x, y] = move[0];
      const [fx, fy] = move[len - 1];
      const p = board[y][x];
      const top = side === 1 ? 7 : 0;
      const crowned = p === side && fy === top;

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
      makeMove(move);
    },
    [board, side, makeMove]
  );

  useEffect(() => {
    worker.addEventListener('message', onComplete, false);
    worker.postMessage({ board, side });
    return () => {
      worker.removeEventListener('message', onComplete, false);
    };
  }, [board, side, onComplete]);

  return (
    <Board
      board={board}
      canDrag={() => false}
      canDrop={() => false}
      endDrag={() => undefined}
    />
  );
}
