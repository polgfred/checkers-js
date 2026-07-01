import { type ReactNode } from 'preact/compat';

import styles from './board.module.css';
import { useDrag } from './drag-provider';
import { useGameContext } from './game-context';
import type { Coords } from './types';

export function Square({ x, y, children }: Coords & { children: ReactNode }) {
  const { source, target } = useDrag();
  const { canMove, canMoveTo } = useGameContext();
  const canMoveFromSquare = canMove({ x, y });
  const canDrop = !!source && canMoveTo(source, { x, y });
  const isOver = !!target && target.x === x && target.y === y;

  return (
    <td
      className={styles.squareCell}
      data-square
      data-x={x}
      data-y={y}
      data-can-move={canMoveFromSquare ? 'true' : undefined}
      data-can-drop={canDrop ? 'true' : undefined}
      data-is-over={isOver ? 'true' : undefined}
    >
      {children}
    </td>
  );
}
