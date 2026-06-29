import { createContext, useCallback, useEffect, useState } from 'preact/compat';
import { DragDropProvider } from '@dnd-kit/react';

import {
  SideType,
  PieceType,
  type JumpStepType,
  type StartType,
  copyBoard,
} from '@checkers/core';

import { Board } from './board';
import { useGameContext } from './game-context';
import { PieceOverlay } from './piece';
import type { Coords } from './types';

const { RED } = SideType;
const { EMPTY, RED_PIECE, WHT_PIECE } = PieceType;

export interface PlayerContextType {
  canMove: (xy: Coords) => boolean;
  canMoveTo: (xy: Coords, nxny: Coords) => boolean;
  moveTo: (xy: Coords, nxny: Coords) => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  canMove: () => false,
  canMoveTo: () => false,
  moveTo: () => undefined,
});

type JumpBuild = {
  start: StartType;
  steps: JumpStepType[];
};

export function Player() {
  const { board, side, plays, handlePlay, getMove } = useGameContext();

  // make a copy of the board and plays tree in local state
  const [{ cboard, cplays, currentJump }, setState] = useState(() => ({
    cboard: copyBoard(board),
    cplays: plays,
    currentJump: null as JumpBuild | null,
  }));

  // automatically reset local state when board changes
  useEffect(() => {
    setState({
      cboard: copyBoard(board),
      cplays: plays,
      currentJump: null as JumpBuild | null,
    });
  }, [board, plays, side]);

  // get the computer's move if it's white to play
  useEffect(() => {
    if (side === SideType.WHT) {
      getMove(board, side).then((play) => {
        if (play) handlePlay(play);
      });
    }
  }, [board, getMove, handlePlay, side]);

  const canMove = useCallback(
    ({ x, y }: Coords) => !!cplays[`${x},${y}`],
    [cplays]
  );

  const canMoveTo = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords) =>
      !!cplays[`${x},${y}`]?.[`${nx},${ny}`],
    [cplays]
  );

  const moveTo = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords) => {
      // see if this move is in the tree
      const next = cplays[`${x},${y}`];

      if (next) {
        const next2 = next[`${nx},${ny}`];

        if (next2) {
          const p = cboard[y][x];
          const crowned =
            side === RED
              ? p === RED_PIECE && ny === 7
              : p === WHT_PIECE && ny === 0;

          // it's a jump, so remove the jumped piece too
          if (Math.abs(nx - x) === 2) {
            const mx = (x + nx) >> 1;
            const my = (y + ny) >> 1;
            const step: JumpStepType = [nx, ny, mx, my];

            const nextJump = currentJump
              ? {
                  start: currentJump.start,
                  steps: [...currentJump.steps, step],
                }
              : { start: [x, y] as const, steps: [step] };

            if (Object.keys(next2).length === 0) {
              // move is done, switch sides
              handlePlay({
                kind: 'jump',
                start: nextJump.start,
                // @ts-expect-error we have at least one step
                steps: nextJump.steps,
              });
            } else {
              // move to this position in the local state
              const nextBoard = copyBoard(cboard);
              nextBoard[y][x] = EMPTY;
              nextBoard[ny][nx] = crowned ? ((p << 1) as PieceType) : p;
              nextBoard[my][mx] = EMPTY;
              setState({
                cboard: nextBoard,
                cplays: next,
                currentJump: nextJump,
              });
            }
          } else {
            handlePlay({
              kind: 'move',
              start: [x, y],
              end: [nx, ny],
            });
          }
        }
      }
    },
    [cboard, side, cplays, currentJump, handlePlay]
  );

  return (
    <DragDropProvider<Coords>
      onDragEnd={(event) => {
        const {
          operation: { source, target },
        } = event;
        if (!source || !target) return;
        if (!canMoveTo(source.data, target.data)) return;
        moveTo(source.data, target.data);
      }}
    >
      <PlayerContext.Provider
        value={{
          canMove,
          canMoveTo,
          moveTo,
        }}
      >
        <Board board={cboard} />
        <PieceOverlay />
      </PlayerContext.Provider>
    </DragDropProvider>
  );
}
