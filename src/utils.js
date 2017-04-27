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
