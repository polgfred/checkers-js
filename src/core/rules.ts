import {
  type BoardType,
  type MoveType,
  type SegmentType,
  type TreeType,
  type _MutableMoveType,
  SideType,
  PieceType,
} from './types';

const { RED } = SideType;
const { EMPTY, RED_KING, WHT_KING } = PieceType;

type MoveGenerator = Generator<MoveType, boolean, void>;

export interface Rules {
  readonly getBoard: () => BoardType;
  readonly getSide: () => SideType;
  readonly findJumps: () => MoveGenerator;
  readonly findMoves: () => MoveGenerator;
  readonly findPlays: () => MoveGenerator;
  readonly buildTree: () => TreeType;
}

// `board` will be mutated by the rules engine, so make a copy first
export function makeRules(board: BoardType, side: SideType): Rules {
  function* findJumps(): MoveGenerator {
    const bottom = side === RED ? 0 : 7;
    let found = false;

    // loop through playable squares
    for (let y = bottom; (y & ~7) === 0; y += side) {
      for (let x = bottom; (x & ~7) === 0; x += side) {
        // see if it's our piece
        const p = board[y][x];

        if (side === RED ? p > 0 : p < 0) {
          // checking for jumps is inherently recursive - as long as you find them,
          // you have to keep looking, and only termimal positions are valid
          const more = yield* nextJump([[x, y]]);
          found ||= more;
        }
      }
    }

    return found;
  }

  function* nextJump(cur: _MutableMoveType): MoveGenerator {
    const [x, y] = cur[cur.length - 1];
    const p = board[y][x];
    const top = side === RED ? 7 : 0;
    const king = p === (side === RED ? RED_KING : WHT_KING);
    let found = false;

    // loop over directions (dx, dy) from the current square
    for (let dy = king ? -1 : 1; dy <= 1; dy += 2) {
      for (let dx = -1; dx <= 1; dx += 2) {
        // calculate middle and landing coordinates
        let mx: number;
        let my: number;
        let nx: number;
        let ny: number;
        if (side === RED) {
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
        if (((nx | ny) & ~7) === 0) {
          const m = board[my][mx];
          const n = board[ny][nx];

          // see if the middle piece is an opponent and the landing is open
          if (n === EMPTY && (side === RED ? m < 0 : m > 0)) {
            const crowned = !king && ny === top;
            found = true;

            // keep track of the coordinates, and move the piece
            board[y][x] = EMPTY;
            board[my][mx] = EMPTY;
            // @ts-expect-error
            board[ny][nx] = crowned ? p << 1 : p;

            // if we're crowned, or there are no further jumps from here,
            // we've reached a terminal position
            cur.push([nx, ny, mx, my]);
            if (crowned || !(yield* nextJump(cur))) {
              yield [...cur];
            }

            // put things back where we found them
            cur.pop();
            board[y][x] = p;
            board[my][mx] = m;
            board[ny][nx] = EMPTY;
          }
        }
      }
    }

    // return whether more jumps were found from this position
    return found;
  }

  function* findMoves(): MoveGenerator {
    const bottom = side === RED ? 0 : 7;
    let found = false;

    // loop through playable squares
    for (let y = bottom; (y & ~7) === 0; y += side) {
      for (let x = bottom; (x & ~7) === 0; x += side) {
        const p = board[y][x];
        const top = side === RED ? 7 : 0;
        const king = p === (side === RED ? RED_KING : WHT_KING);
        const cur = [x, y] as SegmentType;

        // see if it's our piece
        if (side === RED ? p > 0 : p < 0) {
          // loop over directions (dx, dy) from the current square
          for (let dy = king ? -1 : 1; dy <= 1; dy += 2) {
            for (let dx = -1; dx <= 1; dx += 2) {
              // calculate landing coordinates
              let nx: number;
              let ny: number;
              if (side === RED) {
                nx = x + dx;
                ny = y + dy;
              } else {
                nx = x - dx;
                ny = y - dy;
              }

              // see if move is on the board
              if (((nx | ny) & ~7) === 0) {
                // see if the landing is open
                if (board[ny][nx] === EMPTY) {
                  const crowned = !king && ny === top;
                  found = true;

                  // move the piece
                  board[y][x] = EMPTY;
                  // @ts-expect-error
                  board[ny][nx] = crowned ? p << 1 : p;

                  // this is a terminal position
                  yield [cur, [nx, ny]];

                  // put things back where we found them
                  board[y][x] = p;
                  board[ny][nx] = EMPTY;
                }
              }
            }
          }
        }
      }
    }

    return found;
  }

  function* findPlays() {
    // you have to jump if you can
    return (yield* findJumps()) || (yield* findMoves());
  }

  function buildTree() {
    const tree = {} as TreeType;

    for (const play of findPlays()) {
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
    findMoves,
    findPlays,
    buildTree,
  };
}
