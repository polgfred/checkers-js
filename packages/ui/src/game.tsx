import { useCallback, useState } from 'react';
import { castDraft, produce } from 'immer';

import {
  BoardType,
  PlayType,
  SideType,
  makeRules,
  newBoard,
} from '@checkers/core';

import { GameContext } from './game-context';
import { HumanPlayer } from './human-player';
import { ComputerPlayer } from './computer-player';
import { History } from './history';
import { Board } from './board';
import styles from './styles.module.css';

const { RED } = SideType;

export type GetMove = (
  board: BoardType,
  side: SideType
) => Promise<PlayType | null | undefined>;

export interface GameProps {
  getMove: GetMove;
}

export function Game({ getMove }: GameProps) {
  const [rules, setRules] = useState(() => makeRules(newBoard(), RED));
  const { getBoard, getSide, doPlay, buildTree } = rules;

  const board = getBoard();
  const side = getSide();
  const plays = buildTree();
  const gameOver = Object.keys(plays).length === 0;
  const winner = side === RED ? 'White' : 'Red';
  const [hist, setHist] = useState([] as [PlayType | null, PlayType | null][]);

  // make this play, update the history, and force a re-render
  const handlePlay = useCallback(
    (move: PlayType) => {
      const moveSide = getSide();
      doPlay(move);
      setHist((prev) =>
        produce(prev, (draft) => {
          if (moveSide === RED) {
            draft.push([castDraft(move), null]);
          } else if (draft.length > 0) {
            const last = draft[draft.length - 1];
            last[1] = castDraft(move);
          }
        })
      );
    },
    [doPlay, getSide]
  );

  const handlePlayAgain = useCallback(() => {
    setRules(makeRules(newBoard(), RED));
    setHist([]);
  }, []);

  return (
    <GameContext.Provider
      value={{
        board,
        side,
        plays,
        hist,
        getMove,
        handlePlay,
      }}
    >
      <div className={styles.gameContainer}>
        <div className={styles.boardStage}>
          {gameOver ? (
            <>
              <Board board={board} />
              <div className={styles.gameOverOverlay}>
                <div className={styles.gameOverPanel}>
                  <h2 className={styles.gameOverTitle}>{winner} wins!</h2>
                  <button
                    className={styles.playAgainButton}
                    onClick={handlePlayAgain}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </>
          ) : side === RED ? (
            <HumanPlayer />
          ) : (
            <ComputerPlayer />
          )}
        </div>
        <History />
      </div>
    </GameContext.Provider>
  );
}
