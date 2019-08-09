import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';

import RedPiece from '../images/red-piece.svg';
import RedKing from '../images/red-king.svg';
import WhitePiece from '../images/white-piece.svg';
import WhiteKing from '../images/white-king.svg';

export function getPieceElement(p) {
  switch (p) {
    case 1:
      return <RedPiece />;
    case 2:
      return <RedKing />;
    case -1:
      return <WhitePiece />;
    case -2:
      return <WhiteKing />;
    default:
      return null;
  }
}

export default function Piece({ x, y, p, canDrag, endDrag }) {
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

  return connectDragSource(
    <div
      className={classNames({
        'piece-container': true,
        'is-dragging': _isDragging,
      })}
    >
      {getPieceElement(p)}
    </div>
  );
}
