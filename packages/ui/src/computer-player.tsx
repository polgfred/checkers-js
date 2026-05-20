import { useEffect } from 'react';

import { Board } from './board';
import { useGameContext } from './game-context';

export function ComputerPlayer() {
  const { board, side, getMove, handlePlay } = useGameContext();

  useEffect(() => {
    getMove(board, side).then((play) => {
      if (play) {
        handlePlay(play);
      }
    });
  }, [board, side, getMove, handlePlay]);

  return <Board board={board} />;
}
