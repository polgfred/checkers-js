import { useCallback, useContext, useState } from 'react';

import {
  SideType,
  PieceType,
  isPieceOf,
  _MutableMoveType,
} from '../core/types';
import { copyBoard } from '../core/utils';

import { Board } from './board';
import { GameContext } from './game-context';
import { PlayerContext } from './player-context';
import type { Coords } from './types';

const { EMPTY } = PieceType;

export function HumanPlayer() {
  const { board, side, plays, handlePlay } = useContext(GameContext);

  // make a copy of the board and plays tree in local state
  const [{ cboard, cplays, current }, setState] = useState(() => ({
    cboard: copyBoard(board),
    cplays: plays,
    current: [] as _MutableMoveType,
  }));

  const canMove = useCallback(
    ({ x, y }: Coords) => {
      // see if this position is in the tree
      if (cplays[`${x},${y}`]) {
        return true;
      }
    },
    [cplays]
  );

  const canMoveTo = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords) => {
      // see if this move is in the tree
      if (cplays[`${x},${y}`]?.[`${nx},${ny}`]) {
        return true;
      }
    },
    [cplays]
  );

  const moveTo = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords) => {
      // see if this move is in the tree
      const next = cplays[`${x},${y}`];

      if (next) {
        const next2 = next[`${nx},${ny}`];

        if (next2) {
          const p: PieceType = cboard[y][x];
          const top = side === SideType.RED ? 7 : 0;
          const crowned = isPieceOf(side, p) && ny === top;

          // move the piece
          // eslint-disable-next-line react-hooks/immutability
          cboard[y][x] = EMPTY;
          cboard[ny][nx] = crowned ? p << 1 : p;

          // record the current leg
          if (current.length === 0) {
            current.push([x, y]);
          }

          // it's a jump, so remove the jumped piece too
          if (Math.abs(nx - x) === 2) {
            const mx = (x + nx) >> 1;
            const my = (y + ny) >> 1;

            cboard[my][mx] = EMPTY;
            current.push([nx, ny, mx, my]);
          } else {
            current.push([nx, ny]);
          }

          if (Object.keys(next2).length === 0) {
            // move is done, switch sides
            handlePlay(current);
          } else {
            // move to this position in the local state
            setState({ cboard, cplays: next, current });
          }
        }
      }
    },
    [cboard, side, cplays, current, handlePlay]
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
