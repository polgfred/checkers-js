import { BoardType, PieceType, coordsToNumber } from '@checkers/core';

import { Square } from './square';
import { Piece } from './piece';
import boardStyles from './board.module.css';
import styles from './styles.module.css';

const COORDS = [0, 1, 2, 3, 4, 5, 6, 7];
const REV_COORDS = COORDS.slice().reverse();

export function Board({ board }: { board: BoardType }) {
  return (
    <div className={styles.boardStage}>
      <div className={`${styles.panelSurface} ${boardStyles.boardContainer}`}>
        <table className={boardStyles.boardTable}>
          <tbody>
            {REV_COORDS.map((y) => (
              <tr key={y}>
                {COORDS.map((x) =>
                  (x + y) % 2 === 0 ? (
                    <Square key={x} x={x} y={y}>
                      <span>{coordsToNumber(x, y)}</span>
                      {board[y][x] === PieceType.EMPTY ? null : (
                        <Piece x={x} y={y} p={board[y][x]} />
                      )}
                    </Square>
                  ) : (
                    <td key={x} />
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
