import { useCallback, useContext, useEffect } from 'react';

import { Board } from './board';
import { GameContext } from './game_context';
import { SideType } from '../core/types';

export function ComputerPlayer() {
  const { board, side, makeMove } = useContext(GameContext);

  const getMove = useCallback(async () => {
    if (side === SideType.RED) {
      return;
    }
    const response = await fetch('/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, side }),
    });
    const move = await response.json();
    makeMove(move);
  }, [board, side, makeMove]);

  useEffect(() => {
    getMove();
  }, [getMove]);

  return <Board board={board} />;
}
