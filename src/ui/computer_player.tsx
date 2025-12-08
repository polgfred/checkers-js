import { useCallback, useContext, useEffect } from 'react';

import { Board } from './board';
import { GameContext } from './game_context';

export function ComputerPlayer() {
  const { board, side, makeMove } = useContext(GameContext);

  const handleMove = useCallback(async () => {
    const response = await fetch('/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board, side }),
    });
    const move = await response.json();
    makeMove(move);
  }, [board, side, makeMove]);

  useEffect(() => {
    handleMove();
  }, [handleMove]);

  return <Board board={board} />;
}
