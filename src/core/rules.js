export default class Rules {
  constructor(board, side) {
    this.board = board;
    this.side = side;
  }

  findJumps() {
    let { board, side } = this,
      top = side === 1 ? 7 : 0,
      out = top + side,
      bottom = top ^ 7,
      jumps = [];

    // loop through playable squares
    for (let y = bottom; y !== out; y += side) {
      for (let x = bottom; x !== out; x += side) {
        // see if it's our piece
        let p = board[y][x];

        if (side * p > 0) {
          // checking for jumps is inherently recursive - as long as you find them,
          // you have to keep looking, and only termimal positions are valid
          this.nextJump([[x, y]], jumps);
        }
      }
    }

    return jumps;
  }

  nextJump(cur, jumps) {
    let { board, side } = this,
      [x, y] = cur[cur.length - 1],
      p = board[y][x],
      top = side === 1 ? 7 : 0,
      king = p === side * 2,
      found = false;

    // loop over directions (dx, dy) from the current square
    for (let dy = king ? -1 : 1; dy !== 3; dy += 2) {
      for (let dx = -1; dx !== 3; dx += 2) {
        let mx, my, nx, ny;

        // calculate middle and landing coordinates
        if (side === 1) {
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
          if (n === 0 && side * m < 0) {
            let crowned = !king && ny === top;
            found = true;

            // keep track of the coordinates, and move the piece
            board[y][x] = 0;
            board[my][mx] = 0;
            board[ny][nx] = crowned ? p * 2 : p;

            // if we're crowned, or there are no further jumps from here,
            // we've reached a terminal position
            cur.push([nx, ny, mx, my]);
            if (crowned || !this.nextJump(cur, jumps)) {
              jumps.push(cur.slice());
            }

            // put things back where we found them
            cur.pop();
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

  withJump(jump, action) {
    let { board, side } = this,
      len = jump.length,
      [x, y] = jump[0],
      [fx, fy] = jump[len - 1],
      p = board[y][x],
      top = side === 1 ? 7 : 0,
      crowned = p === side && fy === top,
      cap = new Array(len);

    // remove the initial piece
    cap[0] = p;
    board[y][x] = 0;

    // loop over the passed in coords
    for (let i = 1; i < len; ++i) {
      let [, , mx, my] = jump[i];

      // perform the jump
      cap[i] = board[my][mx];
      board[my][mx] = 0;
    }

    // final piece
    board[fy][fx] = crowned ? p * 2 : p;

    // do the action
    action();

    // remove the final piece
    board[fy][fx] = 0;

    // loop over the passed in coords in reverse
    for (let i = len - 1; i > 0; --i) {
      let [, , mx, my] = jump[i];

      // put back the captured piece
      board[my][mx] = cap[i];
    }

    // put back initial piece
    board[y][x] = p;
  }

  findMoves() {
    let { board, side } = this,
      top = side === 1 ? 7 : 0,
      out = top + side,
      bottom = top ^ 7,
      moves = [];

    // loop through playable squares
    for (let y = bottom; y !== out; y += side) {
      for (let x = bottom; x !== out; x += side) {
        let p = board[y][x],
          king = p === side * 2;

        // see if it's our piece
        if (side * p > 0) {
          // loop over directions (dx, dy) from the current square
          for (let dy = king ? -1 : 1; dy !== 3; dy += 2) {
            for (let dx = -1; dx !== 3; dx += 2) {
              let nx, ny;

              // calculate landing coordinates
              if (side === 1) {
                nx = x + dx;
                ny = y + dy;
              } else {
                nx = x - dx;
                ny = y - dy;
              }

              // see if move is on the board
              if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                let crowned = !king && ny === top;

                // see if the landing is open
                if (board[ny][nx] === 0) {
                  // keep track of the coordinates, and move the piece
                  board[y][x] = 0;
                  board[ny][nx] = crowned ? p * 2 : p;

                  moves.push([[x, y], [nx, ny]]);

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

  withMove(move, action) {
    let { board, side } = this,
      [[x, y], [nx, ny]] = move,
      p = board[y][x],
      top = side === 1 ? 7 : 0,
      crowned = p === side && ny === top;

    // perform the jump
    board[y][x] = 0;
    board[ny][nx] = crowned ? p * 2 : p;

    // do the action
    action();

    // put things back where we found them
    board[ny][nx] = 0;
    board[y][x] = p;
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

      for (let j = 0; j < play.length; ++j) {
        let [x, y] = play[j],
          k = `${x},${y}`;

        root[k] = root[k] || {};
        root = root[k];
      }
    }

    return tree;
  }
}
