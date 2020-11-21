import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { coordsToNumber } from '../core/utils';

import Square from './square';
import Piece from './piece';
import DragLayer from './drag_layer';

const COORDS = [0, 1, 2, 3, 4, 5, 6, 7];
const REV_COORDS = COORDS.slice().reverse();

export default function Board({ board, canDrag, canDrop, endDrag }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board-container">
        <table className="board">
          <tbody>
            {REV_COORDS.map(y => (
              <tr key={y}>
                {COORDS.map(x => {
                  const p = board[y][x];
                  return (x + y) % 2 === 0 ? (
                    <Square key={x} x={x} y={y} p={p} canDrop={canDrop}>
                      <span>{coordsToNumber(x, y)}</span>
                      {p !== 0 && (
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
