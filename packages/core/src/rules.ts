import {
  SideType,
  PieceType,
  type BoardType,
  type JumpType,
  type MoveType,
  type PlayType,
  type TreeType,
} from './types';

const { RED } = SideType;
const { EMPTY, RED_PIECE, RED_KING, WHT_PIECE, WHT_KING } = PieceType;

const JUMP_TAG = 1;
const MOVE_TAG = 2;

export type Collector = number[];
export type MoveGenerator = Generator<Collector, void, void>;

export interface Rules {
  board: BoardType;
  readonly findJumps: (side: SideType) => MoveGenerator;
  readonly findMoves: (side: SideType) => MoveGenerator;
  readonly doJump: (side: SideType, jump: JumpType) => void;
  readonly doMove: (side: SideType, move: MoveType) => void;
  readonly buildTree: (side: SideType) => TreeType;
}

// search directions (dx, dy) for each piece type
const DIRS_NONE = [] as const;
const DIRS_RED_PIECE = [
  [-1, +1],
  [+1, +1],
] as const;
const DIRS_WHT_PIECE = [
  [+1, -1],
  [-1, -1],
] as const;
const DIRS_RED_KING = [
  [-1, +1],
  [+1, +1],
  [-1, -1],
  [+1, -1],
] as const;
const DIRS_WHT_KING = [
  [+1, -1],
  [-1, -1],
  [+1, +1],
  [-1, +1],
] as const;

function getDirs(p: PieceType) {
  switch (p) {
    case RED_PIECE:
      return DIRS_RED_PIECE;
    case RED_KING:
      return DIRS_RED_KING;
    case WHT_PIECE:
      return DIRS_WHT_PIECE;
    case WHT_KING:
      return DIRS_WHT_KING;
    default:
      return DIRS_NONE;
  }
}

function inBounds(n: number): boolean {
  return (n & ~7) === 0;
}

function isKing(side: SideType, p: PieceType): boolean {
  return p === 2 * side;
}

function isFriendly(side: SideType, p: PieceType): boolean {
  return p === side || p === 2 * side;
}

function isEnemy(side: SideType, p: PieceType): boolean {
  return p === -side || p === -2 * side;
}

function crownPiece(p: PieceType): PieceType {
  switch (p) {
    case RED_PIECE:
      return RED_KING;
    case WHT_PIECE:
      return WHT_KING;
    default:
      return p;
  }
}

function isCrowned(p: PieceType, ny: number): boolean {
  switch (p) {
    case RED_PIECE:
      return ny === 7;
    case WHT_PIECE:
      return ny === 0;
    default:
      return false;
  }
}

function* findJumps(board: BoardType, side: SideType): MoveGenerator {
  const buf: Collector = [JUMP_TAG];
  const bottom = side === RED ? 0 : 7;

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      // see if it's our piece
      const p = board[y][x];

      if (isFriendly(side, p)) {
        // checking for jumps is inherently recursive - as long as you find them,
        // you have to keep looking, and only termimal positions are valid
        buf.push(x, y);
        yield* nextJumps(board, side, buf);
        buf.pop();
        buf.pop();
      }
    }
  }
}

function* nextJumps(
  board: BoardType,
  side: SideType,
  buf: Collector
): MoveGenerator {
  const x = buf[buf.length - 2];
  const y = buf[buf.length - 1];
  const p = board[y][x];

  // loop over directions (dx, dy) from the current square
  for (const [dx, dy] of getDirs(p)) {
    // calculate middle and landing coordinates
    const mx = x + dx;
    const my = y + dy;
    const nx = mx + dx;
    const ny = my + dy;

    // see if jump is on the board
    if (inBounds(nx | ny)) {
      const m = board[my][mx];
      const n = board[ny][nx];

      // see if the middle piece is an opponent and the landing is open
      if (n === EMPTY && isEnemy(side, m)) {
        const crowned = !isKing(side, p) && isCrowned(side, ny);
        let found = false;

        // keep track of the coordinates, and move the piece
        try {
          board[y][x] = EMPTY;
          board[my][mx] = EMPTY;
          board[ny][nx] = crowned ? crownPiece(p) : p;
          buf.push(nx, ny);

          // if we're crowned, don't look any further
          if (!crowned) {
            // see if there are any further jumps from here
            for (const j of nextJumps(board, side, buf)) {
              found = true;
              yield j;
            }
          }

          // we're at a terminal position
          if (!found) yield buf;
          buf.pop();
          buf.pop();
        } finally {
          // put things back where we found them
          board[y][x] = p;
          board[my][mx] = m;
          board[ny][nx] = EMPTY;
        }
      }
    }
  }
}

function* findMoves(board: BoardType, side: SideType): MoveGenerator {
  const bottom = side === RED ? 0 : 7;
  const buf: Collector = [MOVE_TAG];

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      const p = board[y][x];
      buf.push(x, y);

      // see if it's our piece
      if (isFriendly(side, p)) {
        // loop over directions (dx, dy) from the current square
        for (const [dx, dy] of getDirs(p)) {
          // calculate landing coordinates
          const nx = x + dx;
          const ny = y + dy;

          // see if move is on the board
          if (inBounds(nx | ny)) {
            // see if the landing is open
            if (board[ny][nx] === EMPTY) {
              const crowned = !isKing(side, p) && isCrowned(side, ny);

              try {
                // move the piece
                board[y][x] = EMPTY;
                board[ny][nx] = crowned ? crownPiece(p) : p;
                buf.push(nx, ny);
                yield buf;
                buf.pop();
                buf.pop();
              } finally {
                // put things back where we found them
                board[y][x] = p;
                board[ny][nx] = EMPTY;
              }
            }
          }
        }
      }

      // pop off the starting coords
      buf.pop();
      buf.pop();
    }
  }
}

function* findPlays(board: BoardType, side: SideType) {
  // you have to jump if you can
  let found = false;
  for (const jump of findJumps(board, side)) {
    found = true;
    yield jump;
  }
  if (!found) yield* findMoves(board, side);
}

function doJump(board: BoardType, side: SideType, jump: JumpType) {
  const [x, y] = jump.start;
  const [fx, fy] = jump.steps[jump.steps.length - 1];
  const p = board[y][x];
  const crowned = isCrowned(side, fy);

  board[y][x] = EMPTY;
  for (const [, , mx, my] of jump.steps) {
    board[my][mx] = EMPTY;
  }
  board[fy][fx] = crowned ? crownPiece(p) : p;
}

function doMove(board: BoardType, side: SideType, move: MoveType) {
  const [x, y] = move.start;
  const [nx, ny] = move.end;
  const p = board[y][x];
  const crowned = isCrowned(side, ny);

  board[y][x] = EMPTY;
  board[ny][nx] = crowned ? crownPiece(p) : p;
}

function buildTree(board: BoardType, side: SideType) {
  const tree = {} as TreeType;

  const addPath = (coords: number[][]) => {
    let node = tree;
    for (const [x, y] of coords) {
      const key = `${x},${y}`;
      node[key] ??= {};
      node = node[key];
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_tag, ...coords] of findPlays(board, side)) {
    addPath(
      Array.from({ length: coords.length / 2 }).map((_, i) =>
        coords.slice(2 * i, 2 * i + 2)
      )
    );
  }

  return tree;
}

export function convertPlay(buf: Readonly<Collector>): PlayType {
  let [tag, ...coords] = buf;
  const [x, y, nx, ny] = coords.slice(0, 4);
  switch (tag) {
    case JUMP_TAG:
      return {
        kind: 'jump',
        start: [x, y],
        steps: Array.from({ length: coords.length / 2 - 1 }).map((_, i) => {
          const [x, y, nx, ny] = coords.slice(2 * i, 2 * i + 4);
          const [mx, my] = [(x + nx) / 2, (y + ny) / 2];
          return [nx, ny, mx, my] as const;
        }),
      };
    case MOVE_TAG:
      return {
        kind: 'move',
        start: [x, y],
        end: [nx, ny],
      };
    default:
      throw new Error(`malformed play buffer: ${buf}`);
  }
}

// `board` will be mutated by the rules engine, so make a copy first
export function makeRules(board: BoardType): Rules {
  return {
    board,
    findJumps: (side) => findJumps(board, side),
    findMoves: (side) => findMoves(board, side),
    doJump: (side, jump) => doJump(board, side, jump),
    doMove: (side, move) => doMove(board, side, move),
    buildTree: (side) => buildTree(board, side),
  };
}
