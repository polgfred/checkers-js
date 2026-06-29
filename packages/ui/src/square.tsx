import { ReactNode } from 'preact/compat';
import { useDroppable, useDragOperation } from '@dnd-kit/react';

import type { Coords } from './types';
import styles from './board.module.css';
import { useGameContext } from './game-context';

export function Square({ x, y, children }: Coords & { children: ReactNode }) {
  const { source } = useDragOperation<Coords>();
  const { canMove, canMoveTo } = useGameContext();
  const canMoveFromSquare = canMove({ x, y });
  const { ref, isDropTarget } = useDroppable<Coords>({
    id: `square-${x}-${y}`,
    data: { x, y },
  });

  const canDrop = source && canMoveTo(source.data, { x, y });

  return (
    <td
      ref={ref}
      className={styles.squareCell}
      data-can-move={canMoveFromSquare ? 'true' : undefined}
      data-can-drop={canDrop ? 'true' : undefined}
      data-is-over={isDropTarget ? 'true' : undefined}
    >
      {children}
    </td>
  );
}
