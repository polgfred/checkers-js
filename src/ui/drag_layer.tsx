import { DragSourceMonitor, XYCoord, useDragLayer } from 'react-dnd';

import { getPieceElement } from './piece';
import { PieceAtCoords } from './types';

export function DragLayer() {
  const { item, isDragging, sourceClientOffset } = useDragLayer<{
    item: PieceAtCoords;
    isDragging: boolean;
    sourceClientOffset: XYCoord;
  }>((monitor: DragSourceMonitor) => ({
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
