import React, { ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';

import { Coords, DragItem, DropResult } from './types';

export function Square({
  x,
  y,
  canDrop,
  children,
}: {
  x: number;
  y: number;
  canDrop: (xy: Coords, nxny: Coords) => boolean;
  children: ReactNode;
}): JSX.Element {
  const [{ _canDrop, _isOver }, connectDropTarget] = useDrop<
    DragItem,
    DropResult,
    { _canDrop: boolean; _isOver: boolean }
  >({
    accept: 'piece',
    canDrop: (_, monitor) => {
      const source: DragItem = monitor.getItem();
      return canDrop(source, { x, y });
    },
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
