import React, { ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';

type Coords = { x: number; y: number };

type DragItem = {
  type: 'piece';
  p: number;
} & Coords;

export function Square({
  x,
  y,
  canDrop,
  children,
}: {
  x: number;
  y: number;
  canDrop: (item: DragItem, xy: Coords) => boolean;
  children: ReactNode;
}) {
  const [{ _canDrop, _isOver }, connectDropTarget] = useDrop<
    DragItem,
    Coords,
    { _canDrop: boolean; _isOver: boolean }
  >({
    accept: 'piece',
    canDrop: (_, monitor) => canDrop(monitor.getItem(), { x, y }),
    drop: () => ({ x, y }),
    collect: (monitor) => ({
      _canDrop: monitor.canDrop(),
      _isOver: monitor.isOver(),
    }),
  });

  return connectDropTarget(
    <td
      className={classNames({
        playable: true,
        'can-drop': _canDrop,
        'is-over': _isOver,
      })}
    >
      {children}
    </td>
  );
}
