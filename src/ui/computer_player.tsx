import React, { useCallback, useContext, useEffect } from 'react';

import { Board } from './board';
import { GameContext } from './game_context';
import { WorkerData } from './types';

export function ComputerPlayer() {
  const { board, side, makeMove } = useContext(GameContext);

  const onComplete = useCallback(
    ({ data: { move } }: WorkerData) => makeMove(move),
    [makeMove]
  );

  useEffect(() => {
    const worker = new Worker('./worker-bundle.js');
    worker.addEventListener('message', onComplete, false);
    worker.postMessage({ board, side });

    return () => {
      worker.removeEventListener('message', onComplete, false);
      worker.terminate();
    };
  }, [board, side, onComplete]);

  return <Board board={board} />;
}
