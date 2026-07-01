import { PieceType } from '@checkers/core';

import styles from './board.module.css';
import { useDrag } from './drag-provider';
import { useGameContext } from './game-context';
import redKingUrl from './images/red-king.svg';
import redPieceUrl from './images/red-piece.svg';
import whiteKingUrl from './images/white-king.svg';
import whitePieceUrl from './images/white-piece.svg';
import type { PieceAtCoords } from './types';

const { WHT_PIECE, WHT_KING, RED_PIECE, RED_KING } = PieceType;

function pieceUrl(p: PieceType) {
  switch (p) {
    case RED_PIECE:
      return redPieceUrl;
    case RED_KING:
      return redKingUrl;
    case WHT_PIECE:
      return whitePieceUrl;
    case WHT_KING:
      return whiteKingUrl;
    default:
      return null;
  }
}

export function PieceImage({
  p,
  isPreview = false,
}: {
  p: PieceType;
  isPreview?: boolean;
}) {
  const url = pieceUrl(p);
  return (
    url && (
      <img
        className={`${styles.pieceImage} ${isPreview && styles.dragPreview}`}
        src={url}
        draggable={false}
      />
    )
  );
}

export function Piece({ x, y, p }: PieceAtCoords) {
  const { source, setDrag, clearDrag } = useDrag();
  const { canMove } = useGameContext();
  const canMovePiece = canMove({ x, y });

  const onDragStart = (event: DragEvent) => {
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      setDrag(x, y, p);
    });
  };

  const onDragEnd = () => {
    clearDrag();
  };

  const isDragging = !!source && x === source.x && y === source.y;

  return (
    <div
      draggable={canMovePiece}
      className={styles.pieceContainer}
      data-can-move={canMovePiece ? 'true' : undefined}
      data-is-dragging={isDragging ? 'true' : undefined}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <PieceImage p={p} />
    </div>
  );
}

export function PieceOverlay() {
  return null;
}
