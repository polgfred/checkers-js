import type { BoardType, PlayType } from './types';

export function copyBoard(board: BoardType): BoardType {
  return [
    [...board[0]],
    [...board[1]],
    [...board[2]],
    [...board[3]],
    [...board[4]],
    [...board[5]],
    [...board[6]],
    [...board[7]],
  ];
}

// utility to reverse the board rows (for easier visualization)
export function reverseBoard(board: BoardType): BoardType {
  return [
    [...board[7]],
    [...board[6]],
    [...board[5]],
    [...board[4]],
    [...board[3]],
    [...board[2]],
    [...board[1]],
    [...board[0]],
  ];
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
