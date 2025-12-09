import { useContext, useEffect } from 'react';

import { Board } from './board';
import { GameContext } from './game-context';

export function ComputerPlayer() {
  const { board, handleComputerPlay } = useContext(GameContext);

  useEffect(() => {
    handleComputerPlay();
  }, [handleComputerPlay]);

  return <Board board={board} />;
}
