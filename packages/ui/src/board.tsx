import { type BoardType, PieceType, coordsToNumber } from '@checkers/core';

import boardStyles from './board.module.css';
import { Piece } from './piece';
import { Square } from './square';
import styles from './styles.module.css';

export function Board({ board }: { board: BoardType }) {
  return (
    <div className={styles.boardStage}>
      <div className={`${styles.panelSurface} ${boardStyles.boardContainer}`}>
        <table className={boardStyles.boardTable}>
          <tbody>
            {board
              .map((row, y) => (
                <tr key={y}>
                  {row.map((p, x) =>
                    (x + y) % 2 === 0 ? (
                      <Square key={x} x={x} y={y}>
                        <span>{coordsToNumber(x, y)}</span>
                        {p === PieceType.EMPTY ? null : (
                          <Piece x={x} y={y} p={p} />
                        )}
                      </Square>
                    ) : (
                      <td key={x} />
                    )
                  )}
                </tr>
              ))
              .reverse()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
