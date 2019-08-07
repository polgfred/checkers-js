import React, { useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';

import { coordsToNumber } from '../core/utils';

const pieceImages = new Map();
pieceImages.set(+1, 'src/images/red-piece.svg');
pieceImages.set(+2, 'src/images/red-king.svg');
pieceImages.set(-1, 'src/images/white-piece.svg');
pieceImages.set(-2, 'src/images/white-king.svg');

function EmptySquare() {
  return <td />;
}

function Square({ x, y, p, canDrop, children }) {
  const [{ _canDrop, _isOver }, drop] = useDrop({
    accept: 'piece',
    canDrop: (_, monitor) => canDrop(monitor.getItem(), { x, y }),
    drop: () => ({ x, y }),
    collect: monitor => ({
      _canDrop: monitor.canDrop(),
      _isOver: monitor.isOver(),
    }),
  });

  return (
    <td
      ref={drop}
      className={classNames({
        playable: true,
        'can-drop': _canDrop,
        'is-over': _isOver,
      })}
    >
      {children}
    </td>
  );
}

function Piece({ x, y, p, canDrag, endDrag }) {
  const [{ _isDragging }, drag] = useDrag({
    item: { type: 'piece', x, y },
    canDrag: () => canDrag({ x, y }),
    end: (_, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        endDrag(monitor.getItem(), dropResult);
      }
    },
    collect: monitor => ({
      _isDragging: monitor.isDragging(),
    }),
  });

  // let { p, connectDragPreview } = this.props,
  // 	img = new Image();
  // img.src = pieceImages.get(p);
  // connectDragPreview(img);

  return (
    <img
      ref={drag}
      src={pieceImages.get(p)}
      className={classNames({
        'is-dragging': _isDragging,
      })}
    />
  );
}

export default function Board({ board, canDrag, canDrop, endDrag }) {
  function renderRows() {
    const elems = [];

    for (let y = 7; y >= 0; --y) {
      elems.push(<tr key={y}>{renderSquares(y)}</tr>);
    }

    return elems;
  }

  function renderSquares(y) {
    const elems = [];

    for (let x = 0; x <= 7; ++x) {
      if ((x + y) % 2 == 0) {
        const p = board[y][x];

        elems.push(
          <Square key={x} x={x} y={y} p={p} canDrop={canDrop}>
            <span>{coordsToNumber(x, y)}</span>
            {p != 0 && (
              <Piece x={x} y={y} p={p} canDrag={canDrag} endDrag={endDrag} />
            )}
          </Square>
        );
      } else {
        elems.push(<EmptySquare key={x} />);
      }
    }

    return elems;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board-container">
        <table className="board">
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </DndProvider>
  );
}
