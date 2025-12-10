import {
  SideType,
  PieceType,
  type BoardType,
  type MoveType,
  type SegmentType,
  type TreeType,
} from './types';

const { RED } = SideType;
const { EMPTY, RED_PIECE, RED_KING, WHT_PIECE, WHT_KING } = PieceType;

type MoveGenerator = Generator<MoveType, void, void>;

export interface Rules {
  readonly getBoard: () => BoardType;
  readonly getSide: () => SideType;
  readonly findJumps: () => MoveGenerator;
  readonly findMoves: () => MoveGenerator;
  readonly findPlays: () => MoveGenerator;
  readonly doJump: (jump: MoveType) => void;
  readonly doMove: (move: MoveType) => void;
  readonly doPlay: (play: MoveType) => void;
  readonly buildTree: () => TreeType;
}

// directions to scan while looking for moves
const redBoth = [-1, 1];
const whtBoth = [1, -1];
const redForward = [1];
const whtForward = [-1];

// `board` will be mutated by the rules engine, so make a copy first
export function makeRules(board: BoardType, side: SideType): Rules {
  function* findJumps(): MoveGenerator {
    const bottom = side === RED ? 0 : 7;

    // loop through playable squares
    for (let y = bottom; (y & ~7) === 0; y += side) {
      for (let x = bottom; (x & ~7) === 0; x += side) {
        // see if it's our piece
        const p = board[y][x];

        if (side === RED ? p > 0 : p < 0) {
          // checking for jumps is inherently recursive - as long as you find them,
          // you have to keep looking, and only termimal positions are valid
          yield* nextJumps([[x, y]]);
        }
      }
    }
  }

  function* nextJumps(cur: SegmentType[]): MoveGenerator {
    const [x, y] = cur[cur.length - 1];
    const p = board[y][x];
    const top = side === RED ? 7 : 0;
    const king = p === (side === RED ? RED_KING : WHT_KING);

    // loop over directions (dx, dy) from the current square
    const xdirs = side === RED ? redBoth : whtBoth;
    const ydirs =
      side === RED
        ? king
          ? redBoth
          : redForward
        : king
          ? whtBoth
          : whtForward;

    for (const dy of ydirs) {
      for (const dx of xdirs) {
        // calculate middle and landing coordinates
        const mx = x + dx;
        const my = y + dy;
        const nx = mx + dx;
        const ny = my + dy;

        // see if jump is on the board
        if (((nx | ny) & ~7) === 0) {
          const m = board[my][mx];
          const n = board[ny][nx];

          // see if the middle piece is an opponent and the landing is open
          if (n === EMPTY && (side === RED ? m < 0 : m > 0)) {
            const crowned = !king && ny === top;
            let found = false;

            // keep track of the coordinates, and move the piece
            cur.push([nx, ny, mx, my]);
            board[y][x] = EMPTY;
            board[my][mx] = EMPTY;
            board[ny][nx] = crowned ? ((p << 1) as PieceType) : p;

            // if we're crowned, don't look any further
            if (!crowned) {
              // see if there are any further jumps from here
              for (const j of nextJumps(cur)) {
                found = true;
                yield j;
              }
            }
            if (crowned || !found) {
              // we're at a terminal position
              side = -side as SideType;
              yield [...cur];
              side = -side as SideType;
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
  }

  function* findMoves(): MoveGenerator {
    const bottom = side === RED ? 0 : 7;

    // loop through playable squares
    for (let y = bottom; (y & ~7) === 0; y += side) {
      for (let x = bottom; (x & ~7) === 0; x += side) {
        const p = board[y][x];
        const top = side === RED ? 7 : 0;
        const king = p === (side === RED ? RED_KING : WHT_KING);
        const cur = [x, y] as const;

        // see if it's our piece
        if (side === RED ? p > 0 : p < 0) {
          // loop over directions (dx, dy) from the current square
          const xdirs = side === RED ? redBoth : whtBoth;
          const ydirs =
            side === RED
              ? king
                ? redBoth
                : redForward
              : king
                ? whtBoth
                : whtForward;

          for (const dy of ydirs) {
            for (const dx of xdirs) {
              // calculate landing coordinates
              const nx = x + dx;
              const ny = y + dy;

              // see if move is on the board
              if (((nx | ny) & ~7) === 0) {
                // see if the landing is open
                if (board[ny][nx] === EMPTY) {
                  const crowned = !king && ny === top;

                  // move the piece
                  board[y][x] = EMPTY;
                  board[ny][nx] = crowned ? ((p << 1) as PieceType) : p;
                  side = -side as SideType;

                  yield [cur, [nx, ny]];

                  // put things back where we found them
                  board[y][x] = p;
                  board[ny][nx] = EMPTY;
                  side = -side as SideType;
                }
              }
            }
          }
        }
      }
    }
  }

  function* findPlays() {
    // you have to jump if you can
    let found = false;
    for (const jump of findJumps()) {
      found = true;
      yield jump;
    }
    if (!found) {
      for (const move of findMoves()) {
        yield move;
      }
    }
  }

  function doJump(jump: MoveType) {
    const len = jump.length;
    const [x, y] = jump[0];
    const [fx, fy] = jump[len - 1];
    const p = board[y][x];
    const crowned =
      side === RED ? p === RED_PIECE && fy === 7 : p === WHT_PIECE && fy === 0;

    board[y][x] = EMPTY;
    for (let i = 1; i < len; ++i) {
      const [, , mx, my] = jump[i];
      board[my][mx] = EMPTY;
    }
    board[fy][fx] = crowned ? ((p << 1) as PieceType) : p;
    side = -side as SideType;
  }

  function doMove(move: MoveType) {
    const [[x, y], [nx, ny]] = move;
    const p = board[y][x];
    const crowned =
      side === RED ? p === RED_PIECE && ny === 7 : p === WHT_PIECE && ny === 0;

    board[y][x] = EMPTY;
    board[ny][nx] = crowned ? ((p << 1) as PieceType) : p;
    side = -side as SideType;
  }

  function doPlay(play: MoveType) {
    if (play[1].length > 2) {
      doJump(play);
    } else {
      doMove(play);
    }
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
    doJump,
    doMove,
    doPlay,
    buildTree,
  };
}
