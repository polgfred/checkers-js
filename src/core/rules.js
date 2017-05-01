'use strict';

const dirsMap = new Map();
dirsMap.set(+1, [[+1, +1], [-1, +1]]);
dirsMap.set(+2, [[+1, +1], [-1, +1], [+1, -1], [-1, -1]]);
dirsMap.set(-1, [[-1, -1], [+1, -1]]);
dirsMap.set(-2, [[-1, -1], [+1, -1], [-1, +1], [+1, +1]]);

export default class Rules {
  constructor(board, side) {
    this.board = board;
    this.side = side;
  }

  doDirs(p, block) {
    let dirs = dirsMap.get(p);

    for (let i = 0; i < dirs.length; i++) {
      let [dx, dy] = dirs[i];

      block(dx, dy);
    }
  }

  doSquares(block) {
    if (this.side == 1) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          let p = this.board[y][x];

          if (p > 0) {
            block(x, y, p);
          }
        }
      }
    } else if (this.side == -1) {
      for (let y = 7; y >= 0; y--) {
        for (let x = 7; x >= 0; x--) {
          let p = this.board[y][x];

          if (p < 0) {
            block(x, y, p);
          }
        }
      }
    }
  }

  doJumps(x, y, p, current, block) {
    let found = false;

    this.doDirs(p, (dx, dy) => {
      let mx =  x + dx,
          nx = mx + dx,
          my =  y + dy,
          ny = my + dy;

      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        let p = this.board[y][x],
            m = this.board[my][mx],
            n = this.board[ny][nx];

        if (n == 0 && ((this.side ==  1 && m < 0) ||
                       (this.side == -1 && m > 0))) {
          found = true;

          let promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0),
              ncurrent = current.concat([nx, ny]),
              q = (promoted ? p * 2: p);

          this.board[y][x] = 0;
          this.board[my][mx] = 0;
          this.board[ny][nx] = q;

          if (promoted || !this.doJumps(nx, ny, p, ncurrent, block)) {
            block(ncurrent);
          }

          this.board[y][x] = p;
          this.board[my][mx] = m;
          this.board[ny][nx] = 0;
        }
      }
    });

    return found;
  }

  myJumps(block) {
    let found = false;

    this.doSquares((x, y, p) => {
      this.doJumps(x, y, p, [x, y], current => {
        found = true;

        block(current);
      });
    });

    return found;
  }

  doMoves(x, y, p, block) {
    let found = false;

    this.doDirs(p, (dx, dy) => {
      let nx = x + dx,
          ny = y + dy;

      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        let p = this.board[y][x],
            n = this.board[ny][nx];

        if (n == 0) {
          found = true;

          let promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0),
              q = (promoted ? p * 2: p);

          this.board[y][x] = 0;
          this.board[ny][nx] = q;

          block([x, y, nx, ny]);

          this.board[y][x] = p;
          this.board[ny][nx] = 0;
        }
      }
    });

    return found;
  }

  myMoves(block) {
    let found = false;

    this.doSquares((x, y, p) => {
      this.doMoves(x, y, p, current => {
        found = true;

        block(current);
      });
    });

    return found;
  }

  myPlays(block) {
    return this.myJumps(block) || this.myMoves(block);
  }

  collectPlays() {
    let plays = [];

    this.myPlays(play => {
      plays.push(play);
    });

    return plays;
  }

  collectTree() {
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
