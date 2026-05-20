import { XYCoord, useDragLayer } from 'react-dnd';
import { createPortal } from 'react-dom';

import { getPieceElement } from './piece';
import type { PieceAtCoords } from './types';
import styles from './styles.module.css';

export function DragLayer() {
  const { item, isDragging, sourceClientOffset } = useDragLayer<{
    item: PieceAtCoords;
    isDragging: boolean;
    sourceClientOffset: XYCoord | null;
  }>((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    sourceClientOffset: monitor.getSourceClientOffset(),
  }));

  if (!item || !isDragging || !sourceClientOffset) {
    return null;
  }

  const { p } = item;
  const { x, y } = sourceClientOffset;

  return createPortal(
    <div className={styles.dragLayer}>
      <div
        className={styles.dragPreview}
        style={{
          transform: `translate(${x}px,${y}px) rotate(-3deg)`,
        }}
      >
        {getPieceElement(p)}
      </div>
    </div>,
    document.body
  );
}
