import { ReactNode, useCallback, useContext } from 'react';
import { useDrop } from 'react-dnd';

import { PlayerContext } from './player-context';
import type { PieceAtCoords, Coords } from './types';
import styles from './styles.module.css';

export function Square({ x, y, children }: Coords & { children: ReactNode }) {
  const { canMove, canMoveTo } = useContext(PlayerContext);
  const canMoveFromSquare = canMove({ x, y });
  const [{ canDrop, isOver }, connectDropTarget] = useDrop<
    PieceAtCoords,
    Coords,
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
    [x, y, canMoveTo]
  );

  const setDropRef = useCallback(
    (node: HTMLTableCellElement | null) => {
      connectDropTarget(node);
    },
    [connectDropTarget]
  );

  return (
    <td
      ref={setDropRef}
      className={styles.squareCell}
      data-can-move={canMoveFromSquare ? 'true' : undefined}
      data-can-drop={canDrop ? 'true' : undefined}
      data-is-over={isOver ? 'true' : undefined}
    >
      {children}
    </td>
  );
}
