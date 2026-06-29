import { useCallback, useEffect } from 'preact/compat';
import { type DragDropEventHandlers, DragDropProvider } from '@dnd-kit/react';

import { type BoardType, type PlayType, SideType } from '@checkers/core';

import { Board } from './board';
import { GameContext } from './game-context';
import { History } from './history';
import { PieceOverlay } from './piece';
import styles from './styles.module.css';
import { useGameStore } from './store';
import type { Coords } from './types';
import { usePlayer } from './use-player';

const { RED } = SideType;

export type GetMove = (
  board: BoardType,
  side: SideType
) => Promise<PlayType | null | undefined>;

export interface GameProps {
  getMove: GetMove;
}

function GameOverOverlay({
  side,
  handlePlayAgain,
}: {
  side: SideType;
  handlePlayAgain: () => void;
}) {
  const winner = side === RED ? 'White' : 'Red';
  return (
    <div className={styles.gameOverOverlay}>
      <div className={styles.gameOverPanel}>
        <h2 className={styles.gameOverTitle}>{winner} wins!</h2>
        <button className={styles.playAgainButton} onClick={handlePlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}

export function Game({ getMove }: GameProps) {
  const { snapshot, handlePlay, startGame } = useGameStore();
  const { board, side, plays, hist } = snapshot;
  const { currentBoard, canMove, canMoveTo, moveTo } = usePlayer(snapshot);

  const gameOver = Object.keys(plays).length === 0;

  // get the computer's move if it's white to play
  useEffect(() => {
    if (side === SideType.WHT) {
      getMove(board, side).then((play) => {
        if (play) handlePlay(play);
      });
    }
  }, [board, getMove, handlePlay, side]);

  const handlePlayAgain = useCallback(() => {
    startGame();
  }, [startGame]);

  const onBeforeDragStart: DragDropEventHandlers<Coords>['onBeforeDragStart'] =
    useCallback(
      (event) => {
        if (gameOver) event.preventDefault();
      },
      [gameOver]
    );

  const onDragEnd: DragDropEventHandlers<Coords>['onDragEnd'] = useCallback(
    (event) => {
      const {
        operation: { source, target },
      } = event;
      if (!source || !target) return;
      if (!canMoveTo(source.data, target.data)) return;
      // set the draggable's id to match its new location,
      // to ensure that it animates into place correctly
      const { x, y } = target.data;
      source.id = `piece-${x}-${y}`;
      const play = moveTo(source.data, target.data);
      if (play) handlePlay(play);
    },
    [canMoveTo, handlePlay, moveTo]
  );

  return (
    <DragDropProvider<Coords>
      onBeforeDragStart={onBeforeDragStart}
      onDragEnd={onDragEnd}
    >
      <GameContext.Provider
        value={{
          board,
          side,
          plays,
          hist,
          canMove,
          canMoveTo,
        }}
      >
        <div className={styles.gameContainer}>
          <Board board={currentBoard} />
          <History />
          {gameOver && (
            <GameOverOverlay side={side} handlePlayAgain={handlePlayAgain} />
          )}
        </div>
        <PieceOverlay />
      </GameContext.Provider>
    </DragDropProvider>
  );
}
