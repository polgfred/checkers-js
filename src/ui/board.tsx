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

type Coords = { x: number; y: number };

export function Board({
  board,
  canDrag,
  canDrop,
  endDrag,
}: {
  board: BoardType;
  canDrag: (xy: Coords) => boolean;
  canDrop: (xy: Coords, nxny: Coords) => boolean;
  endDrag: (xy: Coords, nxny: Coords) => void;
}): JSX.Element {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board-container">
        <table className="board">
          <tbody>
            {REV_COORDS.map((y) => (
              <tr key={y}>
                {COORDS.map((x) => {
                  const p: PieceType = board[y][x];
                  return (x + y) % 2 === 0 ? (
                    <Square key={x} x={x} y={y} canDrop={canDrop}>
                      <span>{coordsToNumber(x, y)}</span>
                      {p !== PieceType.EMPTY && (
                        <Piece
                          x={x}
                          y={y}
                          p={p}
                          canDrag={canDrag}
                          endDrag={endDrag}
                        />
                      )}
                    </Square>
                  ) : (
                    <td key={x} />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DragLayer />
    </DndProvider>
  );
}
