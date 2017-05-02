'use strict';

export default class Rules {
  constructor(board, side) {
    this.board = board;
    this.side = side;
  }

  jumps() {
    let { board, side } = this,
        bottom = side == 1 ? 0 : 7,
        top = bottom ^ 7,
        jumps = [];

    for (let y = bottom; y != top; y += side) {
      for (let x = bottom; x != top; x += side) {
        let p = board[y][x];

        if (side * p > 0) {
          let cur = [x, y];

          let loop = (x, y) => {
            let found = false;

            for (let dy = p == side * 2 ? -1 : 1; dy <= 1; dy += 2) {
              for (let dx = -1; dx <= 1; dx += 2) {
                let mx = x + side * dx,
                    my = y + side * dy,
                    nx = mx + side * dx,
                    ny = my + side * dy;

                if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                  let m = board[my][mx],
                      n = board[ny][nx];

                  if (n == 0 && side * m < 0) {
                    let king = ny == top;

                    found = true;

                    cur.push(nx, ny);

                    board[y][x] = 0;
                    board[my][mx] = 0;
                    board[ny][nx] = king ? p * 2 : p;

                    if (king || !loop(nx, ny)) {
                      jumps.push(cur.slice());
                    }

                    cur.splice(-2, 2);

                    board[y][x] = p;
                    board[my][mx] = m;
                    board[ny][nx] = 0;
                  }
                }
              }
            }

            return found;
          };

          loop(x, y);
        }
      }
    }

    return jumps;
  }

  moves() {
    let { board, side } = this,
        bottom = side == 1 ? 0 : 7,
        top = bottom ^ 7,
        moves = [];

    for (let y = bottom; y != top; y += side) {
      for (let x = bottom; x != top; x += side) {
        let p = board[y][x];

        if (side * p > 0) {
          for (let dy = p == side * 2 ? -1 : 1; dy <= 1; dy += 2) {
            for (let dx = -1; dx <= 1; dx += 2) {
              let nx = x + side * dx,
                  ny = y + side * dy;

              if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                if (board[ny][nx] == 0) {
                  board[y][x] = 0;
                  board[ny][nx] = ny == top ? p * 2 : p;

                  moves.push([x, y, nx, ny]);

                  board[y][x] = p;
                  board[ny][nx] = 0;
                }
              }
            }
          }
        }
      }
    }

    return moves;
  }

  plays(block) {
    let jumps = this.jumps();

    if (jumps.length) {
      return jumps;
    } else {
      return this.moves();
    }
  }

  xcollectPlays() {
    let plays = [];

    this.myPlays(play => {
      plays.push(play);
    });

    return plays;
  }

  xcollectTree() {
    let plays = {};

    this.myPlays(play => {
      let root = plays;

      for (let i = 0; i < play.length; i += 2) {
        let x = play[i], y = play[i+1], k = `${x},${y}`;

        root[k] = root[k] || {};
        root = root[k];
      }
    });

    return plays;
  }
}
