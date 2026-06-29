import { useCallback } from 'preact/compat';

import { BoardType, PlayType, SideType } from '@checkers/core';

import { Board } from './board';
import { GameContext } from './game-context';
import { History } from './history';
import { Player } from './player-context';
import styles from './styles.module.css';
import { useGameStore } from './store';

const { RED } = SideType;

export type GetMove = (
  board: BoardType,
  side: SideType
) => Promise<PlayType | null | undefined>;

export interface GameProps {
  getMove: GetMove;
}

function GameOver({
  board,
  side,
  handlePlayAgain,
}: {
  board: BoardType;
  side: SideType;
  handlePlayAgain: () => void;
}) {
  const winner = side === RED ? 'White' : 'Red';
  return (
    <>
      <Board board={board} />
      <div className={styles.gameOverOverlay}>
        <div className={styles.gameOverPanel}>
          <h2 className={styles.gameOverTitle}>{winner} wins!</h2>
          <button className={styles.playAgainButton} onClick={handlePlayAgain}>
            Play Again
          </button>
        </div>
      </div>
    </>
  );
}

export function Game({ getMove }: GameProps) {
  const { board, side, plays, hist, handlePlay } = useGameStore();

  const gameOver = Object.keys(plays).length === 0;

  const handlePlayAgain = useCallback(() => {
    // setRules(makeRules(newBoard(), RED));
    // setHist([]);
  }, []);

  if (gameOver) {
    return (
      <GameOver board={board} side={side} handlePlayAgain={handlePlayAgain} />
    );
  }

  return (
    <GameContext.Provider
      value={{
        board,
        side,
        plays,
        hist,
        handlePlay,
        getMove,
      }}
    >
      <div className={styles.gameContainer}>
        <Player />
        <History />
      </div>
    </GameContext.Provider>
  );
}
