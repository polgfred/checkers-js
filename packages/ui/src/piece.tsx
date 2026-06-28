import { useCallback, useContext, useEffect } from 'preact/compat';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { PieceType } from '@checkers/core';

import { PlayerContext } from './player-context';
import type { PieceAtCoords, Coords } from './types';
import styles from './board.module.css';

import redPieceUrl from './images/red-piece.svg';
import redKingUrl from './images/red-king.svg';
import whitePieceUrl from './images/white-piece.svg';
import whiteKingUrl from './images/white-king.svg';

const { WHT_PIECE, WHT_KING, RED_PIECE, RED_KING } = PieceType;

export function getPieceElement(p: PieceType) {
  switch (p) {
    case RED_PIECE:
      return (
        <img
          className={styles.pieceImage}
          src={redPieceUrl}
          alt=""
          draggable={false}
        />
      );
    case RED_KING:
      return (
        <img
          className={styles.pieceImage}
          src={redKingUrl}
          alt=""
          draggable={false}
        />
      );
    case WHT_PIECE:
      return (
        <img
          className={styles.pieceImage}
          src={whitePieceUrl}
          alt=""
          draggable={false}
        />
      );
    case WHT_KING:
      return (
        <img
          className={styles.pieceImage}
          src={whiteKingUrl}
          alt=""
          draggable={false}
        />
      );
    default:
      return null;
  }
}

export function Piece({ x, y, p }: PieceAtCoords) {
  const { canMove, moveTo } = useContext(PlayerContext);
  const canMovePiece = canMove({ x, y });
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
    [x, y, p, canMove, moveTo]
  );

  const setDragRef = useCallback(
    (node: HTMLDivElement | null) => {
      connectDragSource(node);
    },
    [connectDragSource]
  );

  // since we're using a custom drag layer
  useEffect(() => {
    connectDragPreview(getEmptyImage());
  }, [connectDragPreview]);

  return (
    <div
      ref={setDragRef}
      className={styles.pieceContainer}
      data-can-move={canMovePiece ? 'true' : undefined}
      data-is-dragging={isDragging ? 'true' : undefined}
    >
      {getPieceElement(p)}
    </div>
  );
}
