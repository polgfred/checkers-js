import React, { useCallback, useContext, useEffect } from 'react';

import { Board } from './board';
import { GameContext } from './game_context';
import { WorkerData } from './types';

// create a worker once that we'll attach to as needed
const worker = new Worker('./worker-bundle.js');

export function ComputerPlayer(): JSX.Element {
  const { board, side, makeMove } = useContext(GameContext);

  const onComplete = useCallback(
    ({ data: { move } }: WorkerData) => makeMove(move),
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
