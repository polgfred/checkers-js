import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { BoardType, PieceType } from '../core/types';
import { coordsToNumber } from '../core/utils';

import { DragLayer } from './drag_layer';
import { Square } from './square';
import { Piece } from './piece';

const COORDS = [0, 1, 2, 3, 4, 5, 6, 7];
const REV_COORDS = COORDS.slice().reverse();

export function Board({ board }: { board: BoardType }): JSX.Element {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board-container">
        <table className="board">
          <tbody>
            {REV_COORDS.map((y) => (
              <tr key={y}>
                {COORDS.map((x) =>
                  (x + y) % 2 === 0 ? (
                    <Square key={x} x={x} y={y}>
                      <span>{coordsToNumber(x, y)}</span>
                      <Piece x={x} y={y} p={board[y][x]} />
                    </Square>
                  ) : (
                    <td key={x} />
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DragLayer />
    </DndProvider>
  );
}
