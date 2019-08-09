import React from 'react';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';

export default function Square({ x, y, canDrop, children }) {
  const [{ _canDrop, _isOver }, connectDropTarget] = useDrop({
    accept: 'piece',
    canDrop: (_, monitor) => canDrop(monitor.getItem(), { x, y }),
    drop: () => ({ x, y }),
    collect: monitor => ({
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
