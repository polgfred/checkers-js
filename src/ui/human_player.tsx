import React, { useCallback, useContext, useState } from 'react';

import { MoveType, SideType, PieceType, isPieceOf } from '../core/types';
import { copyBoard } from '../core/utils';

import { Board } from './board';
import { GameContext } from './game_context';

type Coords = { x: number; y: number };

const { EMPTY } = PieceType;

export function HumanPlayer(): JSX.Element {
  const { board: _board, side, plays: _plays, makeMove } = useContext(
    GameContext
  );

  // make a copy of the board and plays tree in local state
  const [{ board, plays, current }, setState] = useState(() => ({
    board: copyBoard(_board),
    plays: _plays,
    current: [] as MoveType,
  }));

  const canDrag = useCallback(
    ({ x, y }: Coords) => {
      // see if this position is in the tree
      if (plays[`${x},${y}`]) {
        return true;
      }
    },
    [plays]
  );

  const canDrop = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords) => {
      // see if this move is in the tree
      const next = plays[`${x},${y}`];
      if (next && next[`${nx},${ny}`]) {
        return true;
      }
    },
    [plays]
  );

  const endDrag = useCallback(
    ({ x, y }: Coords, { x: nx, y: ny }: Coords) => {
      // see if this move is in the tree
      const next = plays[`${x},${y}`];

      if (next) {
        const next2 = next[`${nx},${ny}`];

        if (next2) {
          const p: PieceType = board[y][x];
          const top = side === SideType.RED ? 7 : 0;
          const crowned = isPieceOf(side, p) && ny === top;

          // move the piece
          board[y][x] = EMPTY;
          board[ny][nx] = crowned ? p << 1 : p;

          // record the current leg
          if (current.length === 0) {
            current.push([x, y]);
          }

          // it's a jump, so remove the jumped piece too
          if (Math.abs(nx - x) === 2) {
            const mx = (x + nx) >> 1;
            const my = (y + ny) >> 1;

            board[my][mx] = EMPTY;
            current.push([nx, ny, mx, my]);
          } else {
            current.push([nx, ny]);
          }

          if (Object.keys(next2).length === 0) {
            // move is done, switch sides
            makeMove(current);
          } else {
            // move to this position in the local state
            setState({ board, plays: next, current });
          }
        }
      }
    },
    [board, side, plays, current, makeMove]
  );

  return (
    <Board
      board={board}
      canDrag={canDrag}
      canDrop={canDrop}
      endDrag={endDrag}
    />
  );
}
