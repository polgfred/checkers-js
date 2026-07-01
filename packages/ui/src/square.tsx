import { useState, type ReactNode } from 'preact/compat';

import styles from './board.module.css';
import { useDrag } from './drag-provider';
import { useGameContext } from './game-context';
import type { Coords } from './types';

export function Square({ x, y, children }: Coords & { children: ReactNode }) {
  const { source } = useDrag();
  const [isOver, setOver] = useState(false);
  const { canMove, canMoveTo } = useGameContext();
  const canMoveFromSquare = canMove({ x, y });

  const canDrop = !!source && canMoveTo(source, { x, y });

  const onDragEnter = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    setOver(true);
  };

  const onDragLeave = (event: DragEvent) => {
    const target = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as HTMLElement;
    if (target.contains(related)) return;
    setOver(false);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    console.log('over');
  };

  const onDrop = () => {
    console.log('dropped!');
    setOver(false);
  };

  return (
    <td
      className={styles.squareCell}
      data-can-move={canMoveFromSquare ? 'true' : undefined}
      data-can-drop={canDrop ? 'true' : undefined}
      data-is-over={isOver ? 'true' : undefined}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </td>
  );
}
