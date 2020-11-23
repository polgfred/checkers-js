import { copyBoard } from './utils';

// types
export type Board = Int8Array[];
export type Segment = [number, number] | [number, number, number, number];
export type Move = Segment[];
export type Tree = { [key: string]: Tree };

export type Rules = {
  getBoard: () => Board;
  getSide: () => number;
  findJumps: () => Move[];
  nextJump: (cur: Move, jumps: Move[]) => boolean;
  withJump: (jump: Move, action: () => void) => void;
  findMoves: () => Move[];
  withMove: (move: Move, action: () => void) => void;
  findPlays: () => Move[];
  buildTree: () => Tree;
};

export function makeRules(_board: Board, side: number): Rules {
  // don't mutate the caller's board
  const board = copyBoard(_board);

  function findJumps(): Move[] {
    const top = side === 1 ? 7 : 0;
    const out = top + side;
    const bottom = top ^ 7;
    const jumps: Move[] = [];

    // loop through playable squares
    for (let y = bottom; y !== out; y += side) {
      for (let x = bottom; x !== out; x += side) {
        // see if it's our piece
        const p = board[y][x];

        if (side === 1 ? p > 0 : p < 0) {
          // checking for jumps is inherently recursive - as long as you find them,
          // you have to keep looking, and only termimal positions are valid
          nextJump([[x, y]], jumps);
        }
      }
    }

    return jumps;
  }

  function nextJump(cur: Move, jumps: Move[]) {
    const [x, y] = cur[cur.length - 1];
    const p = board[y][x];
    const top = side === 1 ? 7 : 0;
    const king = p === side << 1;
    let found = false;

    // loop over directions (dx, dy) from the current square
    for (let dy = king ? -1 : 1; dy !== 3; dy += 2) {
      for (let dx = -1; dx !== 3; dx += 2) {
        let mx: number;
        let my: number;
        let nx: number;
        let ny: number;

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
          const m = board[my][mx];
          const n = board[ny][nx];

          // see if the middle piece is an opponent and the landing is open
          if (n === 0 && (side === 1 ? m < 0 : m > 0)) {
            const crowned = !king && ny === top;
            found = true;

            // keep track of the coordinates, and move the piece
            board[y][x] = 0;
            board[my][mx] = 0;
            board[ny][nx] = crowned ? p << 1 : p;

            // if we're crowned, or there are no further jumps from here,
            // we've reached a terminal position
            cur.push([nx, ny, mx, my]);
            if (crowned || !nextJump(cur, jumps)) {
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

  function withJump(jump: Move, action: () => void) {
    const len = jump.length;
    const [x, y] = jump[0];
    const [fx, fy] = jump[len - 1];
    const p = board[y][x];
    const top = side === 1 ? 7 : 0;
    const crowned = p === side && fy === top;
    const cap: Segment = new Array(len) as Segment;

    // remove the initial piece
    cap[0] = p;
    board[y][x] = 0;

    // loop over the passed in coords
    for (let i = 1; i < len; ++i) {
      const [, , mx, my] = jump[i];

      // perform the jump
      cap[i] = board[my][mx];
      board[my][mx] = 0;
    }

    // final piece
    board[fy][fx] = crowned ? p << 1 : p;

    // switch sides
    const origSide = side;
    side = side === 1 ? -1 : 1;

    // do the action
    action();

    // switch back
    side = origSide;

    // remove the final piece
    board[fy][fx] = 0;

    // loop over the passed in coords in reverse
    for (let i = len - 1; i > 0; --i) {
      const [, , mx, my] = jump[i];

      // put back the captured piece
      board[my][mx] = cap[i];
    }

    // put back initial piece
    board[y][x] = p;
  }

  function findMoves(): Move[] {
    const top = side === 1 ? 7 : 0;
    const out = top + side;
    const bottom = top ^ 7;
    const moves: Move[] = [];

    // loop through playable squares
    for (let y = bottom; y !== out; y += side) {
      for (let x = bottom; x !== out; x += side) {
        const p = board[y][x];
        const king = p === side << 1;

        // see if it's our piece
        if (side === 1 ? p > 0 : p < 0) {
          // loop over directions (dx, dy) from the current square
          for (let dy = king ? -1 : 1; dy !== 3; dy += 2) {
            for (let dx = -1; dx !== 3; dx += 2) {
              let nx: number;
              let ny: number;

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
                const crowned = !king && ny === top;

                // see if the landing is open
                if (board[ny][nx] === 0) {
                  // keep track of the coordinates, and move the piece
                  board[y][x] = 0;
                  board[ny][nx] = crowned ? p << 1 : p;

                  moves.push([
                    [x, y],
                    [nx, ny],
                  ]);

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

  function withMove(move: Move, action: () => void) {
    const [[x, y], [nx, ny]] = move;
    const p = board[y][x];
    const top = side === 1 ? 7 : 0;
    const crowned = p === side && ny === top;

    // perform the jump
    board[y][x] = 0;
    board[ny][nx] = crowned ? p << 1 : p;

    // switch sides
    const origSide = side;
    side = side === 1 ? -1 : 1;

    // do the action
    action();

    // switch back
    side = origSide;

    // put things back where we found them
    board[ny][nx] = 0;
    board[y][x] = p;
  }

  function findPlays(): Move[] {
    const jumps = findJumps();

    // you have to jump if you can
    if (jumps.length) {
      return jumps;
    } else {
      return findMoves();
    }
  }

  function buildTree(): Tree {
    const plays = findPlays();
    const tree: Tree = {};

    for (let i = 0; i < plays.length; ++i) {
      const play = plays[i];
      let root = tree;

      for (let j = 0; j < play.length; ++j) {
        const [x, y] = play[j];
        const k = `${x},${y}`;

        root[k] = root[k] || {};
        root = root[k];
      }
    }

    return tree;
  }

  return {
    getBoard: () => board,
    getSide: () => side,
    findJumps,
    nextJump,
    withJump,
    findMoves,
    withMove,
    findPlays,
    buildTree,
  };
}
