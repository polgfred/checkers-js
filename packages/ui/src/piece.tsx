import { useEffect, useState } from 'preact/compat';

import { PieceType } from '@checkers/core';

import styles from './board.module.css';
import { useDrag } from './drag-provider';
import { useGameContext } from './game-context';
import redKingUrl from './images/red-king.svg';
import redPieceUrl from './images/red-piece.svg';
import whiteKingUrl from './images/white-king.svg';
import whitePieceUrl from './images/white-piece.svg';
import type { Coords, PieceAtCoords } from './types';

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
  const { source, startDrag } = useDrag();
  const { canMove } = useGameContext();
  const canMovePiece = canMove({ x, y });
  const isDragging = !!source && x === source.x && y === source.y;

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (!canMovePiece) return;
    startDrag({ x, y, p }, event);
  };

  return (
    <div
      className={styles.pieceContainer}
      data-can-move={canMovePiece ? 'true' : undefined}
      data-is-dragging={isDragging ? 'true' : undefined}
      onPointerDown={onPointerDown}
    >
      <PieceImage p={p} />
    </div>
  );
}

// a floating copy of the dragged piece that follows the pointer
export function PieceOverlay() {
  const { source, origin } = useDrag();
  const [pos, setPos] = useState<Coords | null>(null);

  useEffect(() => {
    if (!source) return;
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      setPos(null);
    };
  }, [source]);

  if (!source || !origin) return null;

  const { x, y } = pos ?? origin;

  return (
    <div
      className={styles.dragOverlay}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <PieceImage p={source.p} isPreview />
    </div>
  );
}
