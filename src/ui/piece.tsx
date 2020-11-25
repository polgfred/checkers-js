import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';

import { PieceType } from '../core/types';
import RedPiece from '../images/red-piece.svg';
import RedKing from '../images/red-king.svg';
import WhitePiece from '../images/white-piece.svg';
import WhiteKing from '../images/white-king.svg';

type Coords = { x: number; y: number };

type DragItem = {
  type: 'piece';
  p: PieceType;
} & Coords;

const { WHT_PIECE, WHT_KING, RED_PIECE, RED_KING } = PieceType;

export function getPieceElement(p: PieceType): JSX.Element {
  switch (p) {
    case RED_PIECE:
      return <RedPiece />;
    case RED_KING:
      return <RedKing />;
    case WHT_PIECE:
      return <WhitePiece />;
    case WHT_KING:
      return <WhiteKing />;
    default:
      return null;
  }
}

export function Piece({
  x,
  y,
  p,
  canDrag,
  endDrag,
}: {
  x: number;
  y: number;
  p: PieceType;
  canDrag: ({ x, y }: Coords) => boolean;
  endDrag: (item: DragItem, { x, y }: Coords) => void;
}): JSX.Element {
  const [{ _isDragging }, connectDragSource, connectDragPreview] = useDrag<
    DragItem,
    Coords,
    { _isDragging: boolean }
  >({
    item: { type: 'piece', x, y, p },
    canDrag: () => canDrag({ x, y }),
    end: (_, monitor) => {
      const dropResult: Coords = monitor.getDropResult();
      if (dropResult) {
        endDrag(monitor.getItem(), dropResult);
      }
    },
    collect: (monitor) => ({
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
