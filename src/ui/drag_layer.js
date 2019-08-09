import React from 'react';
import { useDragLayer } from 'react-dnd';

import { getPieceElement } from './piece';

export default function DragLayer() {
  const { item, isDragging, sourceClientOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    sourceClientOffset: monitor.getSourceClientOffset(),
  }));

  if (!item || !isDragging || !sourceClientOffset) {
    return null;
  }

  const { p } = item;
  const { x, y } = sourceClientOffset;

  return (
    <div className="drag-layer">
      <div
        style={{
          transform: `translate(${x}px,${y}px)`,
        }}
      >
        {getPieceElement(p)}
      </div>
    </div>
  );
}
