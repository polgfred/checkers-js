import { useCallback, useState } from 'react';

import { SideType, PieceType, SegmentType, type PlayType } from '../core/types';
import { copyBoard } from '../core/utils';

import { Board } from './board';
import { useGameContext } from './game-context';
import { PlayerContext } from './player-context';
import type { Coords } from './types';

const { RED } = SideType;
const { EMPTY, RED_PIECE, WHT_PIECE } = PieceType;

export function HumanPlayer() {
  const { board, side, plays, handlePlay } = useGameContext();

  // make a copy of the board and plays tree in local state
  const [{ cboard, cplays, current }, setState] = useState(() => ({
    cboard: copyBoard(board),
    cplays: plays,
    current: [] as SegmentType[],
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

          // move the piece
          // eslint-disable-next-line react-hooks/immutability
          cboard[y][x] = EMPTY;
          cboard[ny][nx] = crowned ? ((p << 1) as PieceType) : p;

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
            handlePlay(current as unknown as PlayType);
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
