import { useCallback, useState } from 'react';

import {
  SideType,
  PieceType,
  type JumpStepType,
  type JumpType,
  type MoveType,
  type StartType,
} from '../core/types';
import { copyBoard } from '../core/utils';

import { Board } from './board';
import { useGameContext } from './game-context';
import { PlayerContext } from './player-context';
import type { Coords } from './types';

const { RED } = SideType;
const { EMPTY, RED_PIECE, WHT_PIECE } = PieceType;

type JumpBuild = {
  start: StartType;
  steps: JumpStepType[];
};

export function HumanPlayer() {
  const { board, side, plays, handlePlay } = useGameContext();

  // make a copy of the board and plays tree in local state
  const [{ cboard, cplays, currentJump }, setState] = useState(() => ({
    cboard: copyBoard(board),
    cplays: plays,
    currentJump: null as JumpBuild | null,
  }));

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
              const [first, ...rest] = nextJump.steps;
              if (first) {
                const play: JumpType = {
                  kind: 'jump',
                  start: nextJump.start,
                  steps: [first, ...rest],
                };
                handlePlay(play);
              }
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
            const play: MoveType = {
              kind: 'move',
              start: [x, y] as const,
              end: [nx, ny] as const,
            };
            handlePlay(play);
            return;
          }
        }
      }
    },
    [cboard, side, cplays, currentJump, handlePlay]
  );

  return (
    <PlayerContext.Provider
      value={{
        canMove,
        canMoveTo,
        moveTo,
      }}
    >
      <Board board={cboard} />
    </PlayerContext.Provider>
  );
}
