import { PieceType, type BoardType, type PlayType } from './types';

export function copyBoard(board: BoardType): BoardType {
  // @ts-expect-error arrays are the same size
  return board.map((row) => row.map((p) => p));
}

// utility to reverse the board rows (for easier visualization)
export function reverseBoard(board: BoardType): BoardType {
  // @ts-expect-error we just copied it
  return copyBoard(board).reverse();
}

// set up the initial board position
// prettier-ignore
const initialData = reverseBoard([
  [ 0, -1,  0, -1,  0, -1,  0, -1 ],
  [-1,  0, -1,  0, -1,  0, -1,  0 ],
  [ 0, -1,  0, -1,  0, -1,  0, -1 ],
  [ 0,  0,  0,  0,  0,  0,  0,  0 ],
  [ 0,  0,  0,  0,  0,  0,  0,  0 ],
  [ 1,  0,  1,  0,  1,  0,  1,  0 ],
  [ 0,  1,  0,  1,  0,  1,  0,  1 ],
  [ 1,  0,  1,  0,  1,  0,  1,  0 ],
]);

// make a copy of the initial board position
export function newBoard(): BoardType {
  return copyBoard(initialData);
}

export function coordsToNumber(x: number, y: number): number {
  return ((y + 1) << 2) - (x >> 1);
}

export function moveToString(move: PlayType): string {
  switch (move.kind) {
    case 'move': {
      const [x, y] = move.start;
      const [nx, ny] = move.end;
      return `${coordsToNumber(x, y)} - ${coordsToNumber(nx, ny)}`;
    }
    case 'jump': {
      const [x, y] = move.start;
      let str = String(coordsToNumber(x, y));

      for (const [nx, ny] of move.steps) {
        str += ' x ';
        str += coordsToNumber(nx, ny);
      }

      return str;
    }
  }
}

export function dumpBoard(board: BoardType) {
  return board
    .map((row, y) =>
      row
        .map((p, x) => {
          switch (p) {
            case PieceType.RED_PIECE:
              return 'r';
            case PieceType.RED_KING:
              return 'R';
            case PieceType.WHT_PIECE:
              return 'w';
            case PieceType.WHT_KING:
              return 'W';
            default:
              return (x + y) % 2 === 0 ? '.' : ' ';
          }
        })
        .join('')
    )
    .reverse()
    .join('\n');
}
