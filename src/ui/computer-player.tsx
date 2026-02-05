import { useEffect } from 'react';

import { Board } from './board';
import { useGameContext } from './game-context';

export function ComputerPlayer() {
  const { board, handleComputerPlay } = useGameContext();

  useEffect(() => {
    handleComputerPlay();
  }, [handleComputerPlay]);

  return <Board board={board} />;
}
