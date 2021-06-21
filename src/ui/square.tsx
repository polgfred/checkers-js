import React, { ReactNode, useContext } from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';

import { PlayerContext } from './player_context';
import { DragItem, DropResult } from './types';

export function Square({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactNode;
}): JSX.Element {
  const { canMoveTo } = useContext(PlayerContext);
  const [{ canDrop, isOver }, connectDropTarget] = useDrop<
    DragItem,
    DropResult,
    { canDrop: boolean; isOver: boolean }
  >(
    () => ({
      accept: 'piece',
      canDrop: (source) => canMoveTo(source, { x, y }),
      drop: () => ({ x, y }),
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
      }),
    }),
    [x, y]
  );

  return connectDropTarget(
    <td
      className={classNames({
        playable: true,
        'can-drop': canDrop,
        'is-over': isOver,
      })}
    >
      {children}
    </td>
  );
}
