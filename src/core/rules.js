'use strict';

export default class Rules {
  constructor(board, side) {
    this.board = board;
    this.side = side;
  }

  findJumps() {
    let { board, side } = this,
        top = side == 1 ? 7 : 0,
        bottom = top ^ 7,
        jumps = [];

    // loop through playable squares
    for (let y = bottom; y != top; y += side) {
      for (let x = bottom; x != top; x += side) {
        // see if it's our piece
        let p = board[y][x];

        if (side * p > 0) {
          // checking for jumps is inherently recursive - as long as you find them,
          // you have to keep looking, and only termimal positions are valid
          this.nextJump(x, y, [x, y], jumps);
        }
      }
    }

    return jumps;
  }

  nextJump(x, y, cur, jumps) {
    let { board, side } = this,
        p = board[y][x],
        top = side == 1 ? 7 : 0,
        king = p == side * 2,
        found = false;

    // loop over directions (dx, dy) from the current square
    for (let dy = king ? -1 : 1; dy != 3; dy += 2) {
      for (let dx = -1; dx != 3; dx += 2) {
        let mx, my, nx, ny;

        // calculate middle and landing coordinates
        if (side == 1) {
          mx = x + dx;
          my = y + dy;
          nx = mx + dx;
          ny = my + dy;
        } else {
          mx = x - dx;
          my = y - dy;
          nx = mx - dx;
          ny = my - dy;
        }

        // see if jump is on the board
        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
          let m = board[my][mx],
              n = board[ny][nx];

          // see if the middle piece is an opponent and the landing is open
          if (n == 0 && side * m < 0) {
            let crowned = !king && ny == top;
            found = true;

            // keep track of the coordinates, and move the piece
            board[y][x] = 0;
            board[my][mx] = 0;
            board[ny][nx] = crowned ? p * 2 : p;

            let ncur = cur.concat([nx, ny]);

            // if we're crowned, or there are no further jumps from here,
            // we've reached a terminal position
            if (crowned || !this.nextJump(nx, ny, ncur, jumps)) {
              jumps.push(ncur);
            }

            // put things back where we found them
            board[y][x] = p;
            board[my][mx] = m;
            board[ny][nx] = 0;
          }
        }
      }
    }

    // return whether more jumps were found from this position
    return found;
  }

  doJump(jumps) {
    let { board, side } = this,
        top = side == 1 ? 7 : 0,
        undo = [],
        p;

    // loop over the passed in coords
    for (let i = 0; i < jumps.length - 2; i += 2) {
      let x = jumps[i], y = jumps[i + 1],
          nx = jumps[i + 2], ny = jumps[i + 3],
          mx = (x + nx) / 2, my = (y + ny) / 2;

      // keep track of the piece making the jump
      p = board[y][x];

      let crowned = p == side && ny == top;

      // keep track of the captured piece
      undo.push(board[my][mx]);

      // perform the jump
      board[y][x] = 0;
      board[my][mx] = 0;
      board[ny][nx] = crowned ? p * 2 : p;
    }

    // push on the original piece
    undo.push(p);

    // return everything we need to undo the jump
    return undo;
  }

  undoJump(jumps, undo) {
    let { board } = this,
        p = undo.pop();

    // loop over the passed in coords in reverse
    for (let i = jumps.length - 4; i >= 0; i -= 2) {
      let x = jumps[i], y = jumps[i + 1],
          nx = jumps[i + 2], ny = jumps[i + 3],
          mx = (x + nx) / 2, my = (y + ny) / 2;

      // put things back where we found them
      board[y][x] = p;
      board[my][mx] = undo.pop();
      board[ny][nx] = 0;
    }
  }

  findMoves() {
    let { board, side } = this,
        top = side == 1 ? 7 : 0,
        bottom = top ^ 7,
        moves = [];

    // loop through playable squares
    for (let y = bottom; y != top; y += side) {
      for (let x = bottom; x != top; x += side) {
        let p = board[y][x],
            king = p == side * 2;

        // see if it's our piece
        if (side * p > 0) {
          // loop over directions (dx, dy) from the current square
          for (let dy = king ? -1 : 1; dy != 3; dy += 2) {
            for (let dx = -1; dx != 3; dx += 2) {
              let nx, ny;

              // calculate landing coordinates
              if (side == 1) {
                nx = x + dx;
                ny = y + dy;
              } else {
                nx = x - dx;
                ny = y - dy;
              }

              // see if move is on the board
              if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                let crowned = !king && ny == top;

                // see if the landing is open
                if (board[ny][nx] == 0) {
                  // keep track of the coordinates, and move the piece
                  board[y][x] = 0;
                  board[ny][nx] = crowned ? p * 2 : p;

                  moves.push([x, y, nx, ny]);

                  // put things back where we found them
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

  doMove(move) {
    let { board, side } = this,
        top = side == 1 ? 7 : 0,
        [x, y, nx, ny] = move,
        p = board[y][x],
        crowned = p == side && ny == top;

    // perform the jump
    board[y][x] = 0;
    board[ny][nx] = crowned ? p * 2 : p;

    // return the original piece
    return p;
  }

  undoMove(move, p) {
    let { board } = this,
        [x, y, nx, ny] = move;

    // put things back where we found them
    board[y][x] = p;
    board[ny][nx] = 0;
  }

  findPlays(block) {
    let jumps = this.findJumps();

    // you have to jump if you can
    if (jumps.length) {
      return jumps;
    } else {
      return this.findMoves();
    }
  }

  buildTree() {
    let plays = this.findPlays(),
        tree = {};

    for (let i = 0; i < plays.length; ++i) {
      let play = plays[i],
          root = tree;

      for (let j = 0; j < play.length; j += 2) {
        let x = play[j],
            y = play[j + 1],
            k = `${x},${y}`;

        root[k] = root[k] || {};
        root = root[k];
      }
    }

    return tree;
  }
}
