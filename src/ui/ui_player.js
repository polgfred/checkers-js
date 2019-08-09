import React, { useCallback, useState } from 'react';

import Rules from '../core/rules';
import { copyBoard } from '../core/utils';
import Board from './board';

export default function UIPlayer({ board: _board, side, moveComplete }) {
  const [{ board, plays, current }, setState] = useState(() => {
    // copy the game board to use locally
    const board = copyBoard(_board);
    return {
      board,
      plays: new Rules(board, side).buildTree(),
      current: [],
    };
  });

  const canDrag = useCallback(
    ({ x, y }) => {
      // see if this position is in the tree
      if (plays[`${x},${y}`]) {
        return true;
      }
    },
    [plays]
  );

  const canDrop = useCallback(
    ({ x, y }, { x: nx, y: ny }) => {
      // see if this move is in the tree
      let next = plays[`${x},${y}`];
      if (next && next[`${nx},${ny}`]) {
        return true;
      }
    },
    [plays]
  );

  const endDrag = useCallback(
    ({ x, y }, { x: nx, y: ny }) => {
      // see if this move is in the tree
      const next = plays[`${x},${y}`];

      if (next) {
        const next2 = next[`${nx},${ny}`];

        if (next2) {
          const p = board[y][x];
          const top = side === 1 ? 7 : 0;
          const crowned = p === side && ny === top;

          // move the piece
          board[y][x] = 0;
          board[ny][nx] = crowned ? p * 2 : p;

          // record the current leg
          if (current.length === 0) {
            current.push([x, y]);
          }

          // it's a jump, so remove the jumped piece too
          if (Math.abs(nx - x) === 2) {
            const mx = (x + nx) >> 1;
            const my = (y + ny) >> 1;

            board[my][mx] = 0;
            current.push([nx, ny, mx, my]);
          } else {
            current.push([nx, ny]);
          }

          if (Object.keys(next2).length === 0) {
            // move is done, switch sides
            moveComplete(board, current);
          } else {
            // commit this position
            setState({ board, side, plays: next, current });
          }
        }
      }
    },
    [board, side, plays, current, moveComplete]
  );

  return (
    <Board
      board={board}
      side={side}
      canDrag={canDrag}
      canDrop={canDrop}
      endDrag={endDrag}
    />
  );
}
