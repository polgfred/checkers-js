import React, { useEffect } from 'react';
import { DndProvider, useDrag, useDragLayer, useDrop } from 'react-dnd';
import HTML5Backend, { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';

import { coordsToNumber } from '../core/utils';

import redPiece from '../images/red-piece.svg';
import redKing from '../images/red-king.svg';
import whitePiece from '../images/white-piece.svg';
import whiteKing from '../images/white-king.svg';

const pieceComponents = new Map();
pieceComponents.set(+1, redPiece);
pieceComponents.set(+2, redKing);
pieceComponents.set(-1, whitePiece);
pieceComponents.set(-2, whiteKing);

function EmptySquare() {
  return <td />;
}

function Square({ x, y, canDrop, children }) {
  const [{ _canDrop, _isOver }, connectDropTarget] = useDrop({
    accept: 'piece',
    canDrop: (_, monitor) => canDrop(monitor.getItem(), { x, y }),
    drop: () => ({ x, y }),
    collect: monitor => ({
      _canDrop: monitor.canDrop(),
      _isOver: monitor.isOver(),
    }),
  });

  return connectDropTarget(
    <td
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
  const [{ _isDragging }, connectDragSource, connectDragPreview] = useDrag({
    item: { type: 'piece', x, y, p },
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

  // since we're using a custom drag layer
  useEffect(() => {
    connectDragPreview(getEmptyImage());
  }, [connectDragPreview]);

  const PieceSvg = pieceComponents.get(p);

  return connectDragSource(
    <div
      className={classNames({
        'piece-container': true,
        'is-dragging': _isDragging,
      })}
    >
      <PieceSvg />
    </div>
  );
}

function DragLayer() {
  const { item, isDragging, sourceClientOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    sourceClientOffset: monitor.getSourceClientOffset(),
  }));

  if (!item || !isDragging || !sourceClientOffset) {
    return null;
  }

  const PieceSvg = pieceComponents.get(item.p);

  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          transform: `translate(${sourceClientOffset.x}px,${sourceClientOffset.y}px)`,
          opacity: 0.8,
        }}
      >
        <PieceSvg />
      </div>
    </div>
  );
}

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
                    <EmptySquare key={x} />
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
