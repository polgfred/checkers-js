'use strict';

export function newBoard() {
  let board = as2DArray(new ArrayBuffer(64));

  // set up the initial board position
  board[0][0] = board[0][2] = board[0][4] = board[0][6] = +1;
  board[1][1] = board[1][3] = board[1][5] = board[1][7] = +1;
  board[2][0] = board[2][2] = board[2][4] = board[2][6] = +1;
  board[5][1] = board[5][3] = board[5][5] = board[5][7] = -1;
  board[6][0] = board[6][2] = board[6][4] = board[6][6] = -1;
  board[7][1] = board[7][3] = board[7][5] = board[7][7] = -1;

  return board;
}

export function copyBoard(board) {
  return as2DArray(board[0].buffer.slice());
}

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
