import React, { useContext, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';

import { PieceType } from '../core/types';
import RedPiece from '../images/red-piece.svg';
import RedKing from '../images/red-king.svg';
import WhitePiece from '../images/white-piece.svg';
import WhiteKing from '../images/white-king.svg';

import { PlayerContext } from './player_context';
import { PieceAtCoords, Coords } from './types';

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

export function Piece({ x, y, p }: PieceAtCoords): JSX.Element {
  if (p === PieceType.EMPTY) {
    return null;
  }

  const { canMove, moveTo } = useContext(PlayerContext);
  const [{ isDragging }, connectDragSource, connectDragPreview] = useDrag<
    PieceAtCoords,
    Coords,
    { isDragging: boolean }
  >(
    () => ({
      type: 'piece',
      item: { x, y, p },
      canDrag: () => canMove({ x, y }),
      end: (source, monitor) => {
        const target = monitor.getDropResult();
        if (target) {
          moveTo(source, target);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [x, y, p]
  );

  // since we're using a custom drag layer
  useEffect(() => {
    connectDragPreview(getEmptyImage());
  }, [connectDragPreview]);

  return connectDragSource(
    <div
      className={classNames({
        'piece-container': true,
        'is-dragging': isDragging,
      })}
    >
      {getPieceElement(p)}
    </div>
  );
}
