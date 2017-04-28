'use strict';

// set up the initial board position
const initial = as2DArray(new ArrayBuffer(64));
initial[0][0] = initial[0][2] = initial[0][4] = initial[0][6] = +1;
initial[1][1] = initial[1][3] = initial[1][5] = initial[1][7] = +1;
initial[2][0] = initial[2][2] = initial[2][4] = initial[2][6] = +1;
initial[5][1] = initial[5][3] = initial[5][5] = initial[5][7] = -1;
initial[6][0] = initial[6][2] = initial[6][4] = initial[6][6] = -1;
initial[7][1] = initial[7][3] = initial[7][5] = initial[7][7] = -1;

// make a copy of the initial board position
export function newBoard() {
  return copyBoard(initial);
}

// only use this on boards that are backed by a shared buffer!
export function copyBoard(board) {
  return as2DArray(board[0].buffer.slice());
}

// make a new board from the passed in array data
export function newBoardFromData(data) {
  let board = as2DArray(new ArrayBuffer(64));
  for (let i = 0; i < 8; ++i) {
    board[i].set(data[i])
  }
  return board;
}

// make a 2d array wrapper around a 64-byte buffer
export function as2DArray(buf) {
  return [
    new Int8Array(buf,  0, 8),
    new Int8Array(buf,  8, 8),
    new Int8Array(buf, 16, 8),
    new Int8Array(buf, 24, 8),
    new Int8Array(buf, 32, 8),
    new Int8Array(buf, 40, 8),
    new Int8Array(buf, 48, 8),
    new Int8Array(buf, 56, 8)
  ];
}

export function coordsToNumber(x, y) {
  return 4 * (y + 1) - Math.floor(x / 2);
}

export function moveToString(move) {
  if (move) {
    let str = '';

    for (let i = 0; i < move.length - 2; i += 2) {
      let [x, y, nx, ny] = move.slice(i, i + 4);

      if (i == 0) {
        str += coordsToNumber(x, y);
      }
      str += Math.abs(nx - x) == 2 ? ' x ' : ' - ';
      str += coordsToNumber(nx, ny);
    }

    return str;
  }
}
