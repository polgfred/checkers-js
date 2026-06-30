import { useCallback, useEffect, useState } from 'preact/compat';

import {
  SideType,
  PieceType,
  type JumpStepType,
  type StartType,
  copyBoard,
  PlayType,
} from '@checkers/core';

import type { Coords } from './types';
import type { GameSnapshot } from './store';

const { RED } = SideType;
const { EMPTY, RED_PIECE, WHT_PIECE } = PieceType;

type JumpBuild = {
  start: StartType;
  steps: [JumpStepType, ...JumpStepType[]];
};

// defaults for when it's the computer's move
const defaultCanMove = () => false;
const defaultCanMoveTo = () => false;
const defaultMoveTo = () => null;

export function usePlayer(store: GameSnapshot) {
  const { board, side, plays } = store;

  // make a copy of the board and plays tree in local state
  const [currentBoard, setCurrentBoard] = useState(board);
  const [currentPlays, setCurrentPlays] = useState(plays);
  const [currentJump, setCurrentJump] = useState<JumpBuild | null>(null);

  // automatically reset local state when board changes
  useEffect(() => {
    setCurrentBoard(board);
    setCurrentPlays(plays);
    setCurrentJump(null);
  }, [board, plays, side]);

  const canMove = useCallback(
    ({ x, y }: Coords): boolean => !!currentPlays[`${x},${y}`],
    [currentPlays]
  );

  const canMoveTo = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords): boolean =>
      !!currentPlays[`${x},${y}`]?.[`${nx},${ny}`],
    [currentPlays]
  );

  const moveTo = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords): PlayType | null => {
      // see if this move is in the tree
      const next = currentPlays[`${x},${y}`];

      if (next) {
        const next2 = next[`${nx},${ny}`];

        if (next2) {
          const p = currentBoard[y][x];
          const crowned =
            side === RED
              ? p === RED_PIECE && ny === 7
              : p === WHT_PIECE && ny === 0;

          // it's a jump, so remove the jumped piece too
          if (Math.abs(nx - x) === 2) {
            const mx = (x + nx) >> 1;
            const my = (y + ny) >> 1;
            const step: JumpStepType = [nx, ny, mx, my];

            const nextJump: JumpBuild = {
              start: currentJump?.start ?? [x, y],
              steps: [...(currentJump?.steps ?? []), step],
            };

            if (Object.keys(next2).length === 0) {
              // move is done, switch sides
              return {
                kind: 'jump',
                start: nextJump.start,
                steps: nextJump.steps,
              };
            } else {
              // move to this position in the local state
              const nextBoard = copyBoard(currentBoard);
              nextBoard[y][x] = EMPTY;
              nextBoard[ny][nx] = crowned ? ((p << 1) as PieceType) : p;
              nextBoard[my][mx] = EMPTY;
              setCurrentBoard(nextBoard);
              setCurrentPlays(next);
              setCurrentJump(nextJump);
            }
          } else {
            // move is done
            return {
              kind: 'move',
              start: [x, y],
              end: [nx, ny],
            };
          }
        }
      }

      // wasn't finished (either invalid or jumps left on the board)
      return null;
    },
    [currentBoard, currentPlays, currentJump, side]
  );

  switch (side) {
    case SideType.RED:
      return {
        currentBoard,
        canMove,
        canMoveTo,
        moveTo,
      };
    case SideType.WHT:
      // computer's move
      return {
        currentBoard: board,
        canMove: defaultCanMove,
        canMoveTo: defaultCanMoveTo,
        moveTo: defaultMoveTo,
      };
  }
}
