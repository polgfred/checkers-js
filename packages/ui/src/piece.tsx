import { DragOverlay, useDraggable, useDragOperation } from '@dnd-kit/react';

import { PieceType } from '@checkers/core';

import type { PieceAtCoords } from './types';
import styles from './board.module.css';

import redPieceUrl from './images/red-piece.svg';
import redKingUrl from './images/red-king.svg';
import whitePieceUrl from './images/white-piece.svg';
import whiteKingUrl from './images/white-king.svg';
import { useGameContext } from './game-context';

const { WHT_PIECE, WHT_KING, RED_PIECE, RED_KING } = PieceType;

export function PieceImage({
  p,
  isPreview = false,
}: {
  p: PieceType;
  isPreview?: boolean;
}) {
  let pieceUrl;
  switch (p) {
    case RED_PIECE:
      pieceUrl = redPieceUrl;
      break;
    case RED_KING:
      pieceUrl = redKingUrl;
      break;
    case WHT_PIECE:
      pieceUrl = whitePieceUrl;
      break;
    case WHT_KING:
      pieceUrl = whiteKingUrl;
      break;
    default:
      return null;
  }
  return (
    <img
      className={`${styles.pieceImage} ${isPreview && styles.dragPreview}`}
      src={pieceUrl}
      draggable={false}
    />
  );
}

export function Piece({ x, y, p }: PieceAtCoords) {
  const { canMove } = useGameContext();
  const canMovePiece = canMove({ x, y });
  const { ref, isDragging } = useDraggable<PieceAtCoords>({
    id: `piece-${x}-${y}`,
    disabled: !canMovePiece,
    data: { x, y, p },
  });

  return (
    <div
      ref={ref}
      className={styles.pieceContainer}
      data-can-move={canMovePiece ? 'true' : undefined}
      data-is-dragging={isDragging ? 'true' : undefined}
    >
      <PieceImage p={p} />
    </div>
  );
}

export function PieceOverlay() {
  const { source } = useDragOperation<PieceAtCoords>();
  if (!source) return null;
  return (
    <DragOverlay>
      <PieceImage p={source.data.p} isPreview />
    </DragOverlay>
  );
}
