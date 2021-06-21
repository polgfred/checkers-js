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
  const { canDrop } = useContext(PlayerContext);
  const [{ _canDrop, _isOver }, connectDropTarget] = useDrop<
    DragItem,
    DropResult,
    { _canDrop: boolean; _isOver: boolean }
  >(() => ({
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
  }));

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
