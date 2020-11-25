import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Move } from '../core/rules';
import { Board } from './board';
import { GameContext } from './game_context';

// create a worker once that we'll attach to as needed
const worker = new Worker('./worker-bundle.js');

export function AIPlayer(): JSX.Element {
  const { getBoard, getSide, makeMove } = useContext(GameContext);
  const board = getBoard();
  const side = getSide();

  const onComplete = useCallback(
    ({ data: { move } }: { data: { move: Move } }) => {
      makeMove(move);
    },
    [makeMove]
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
