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

export type Buffer = number[];
export type MoveGenerator = Generator<Buffer, void, void>;

export interface Rules {
  board: BoardType;
  readonly findJumps: (side: SideType, buf?: Buffer) => MoveGenerator;
  readonly findMoves: (side: SideType, buf?: Buffer) => MoveGenerator;
  readonly doJump: (side: SideType, jump: JumpType) => void;
  readonly doMove: (side: SideType, move: MoveType) => void;
  readonly doPlay: (side: SideType, play: PlayType) => void;
  readonly buildTree: (side: SideType, buf?: Buffer) => TreeType;
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

function* findJumps(
  board: BoardType,
  side: SideType,
  buf: Buffer
): MoveGenerator {
  const bottom = side === RED ? 0 : 7;

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      // see if it's our piece
      const p = board[y][x];

      if (isFriendly(side, p)) {
        // checking for jumps is inherently recursive - as long as you find them,
        // you have to keep looking, and only termimal positions are valid
        buf[0] = 0; // score
        buf[1] = 0; // jump
        buf[2] = 0; // legs
        buf[3] = x;
        buf[4] = y;
        yield* nextJumps(x, y);
      }
    }
  }

  function* nextJumps(x: number, y: number): MoveGenerator {
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
            const legs = ++buf[2];
            const pos = 2 * legs + 3;
            buf[pos] = nx;
            buf[pos + 1] = ny;

            // if we're crowned, don't look any further
            if (!crowned) {
              // see if there are any further jumps from here
              for (const j of nextJumps(nx, ny)) {
                found = true;
                yield j;
              }
            }

            // we're at a terminal position
            if (!found) yield buf;
          } finally {
            // put things back where we found them
            --buf[2];
            board[y][x] = p;
            board[my][mx] = m;
            board[ny][nx] = EMPTY;
          }
        }
      }
    }
  }
}

function* findMoves(
  board: BoardType,
  side: SideType,
  buf: Buffer
): MoveGenerator {
  const bottom = side === RED ? 0 : 7;

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      const p = board[y][x];
      buf[0] = 0; // score
      buf[1] = 1; // move
      buf[2] = 0; // legs
      buf[3] = x;
      buf[4] = y;

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
                buf[2] = 1;
                buf[5] = nx;
                buf[6] = ny;
                yield buf;
              } finally {
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
}

function* findPlays(board: BoardType, side: SideType, buf: Buffer) {
  // you have to jump if you can
  let found = false;
  for (const jump of findJumps(board, side, buf)) {
    found = true;
    yield jump;
  }
  if (!found) yield* findMoves(board, side, buf);
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

function doPlay(board: BoardType, side: SideType, play: PlayType) {
  switch (play.kind) {
    case 'jump':
      doJump(board, side, play);
      break;
    case 'move':
      doMove(board, side, play);
      break;
  }
}

function buildTree(board: BoardType, side: SideType, buf: Buffer) {
  const tree = {} as TreeType;

  const addPath = (coords: [number, number][]) => {
    let node = tree;
    for (const [x, y] of coords) {
      const key = `${x},${y}`;
      node[key] ??= {};
      node = node[key];
    }
  };

  findPlays(board, side, buf).forEach(() =>
    addPath(
      Array.from({ length: buf[2] + 1 }).map((_, i) => [
        buf[2 * i + 3],
        buf[2 * i + 4],
      ])
    )
  );

  return tree;
}

export function convertBuffer(buf: Buffer): PlayType {
  let [, kind, legs, x, y, nx, ny, ...rest] = buf;
  switch (kind) {
    case 0:
      return {
        kind: 'jump',
        start: [x, y],
        steps: Array.from({ length: legs }).map((_, i) => {
          const [mx, my] = [(x + nx) >> 1, (y + ny) >> 1];
          const step = [nx, ny, mx, my] as const;
          [x, y] = [nx, ny];
          [nx, ny] = rest.slice(2 * i);
          return step;
        }),
      };
    case 1:
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
    findJumps: (side, buf = []) => findJumps(board, side, buf),
    findMoves: (side, buf = []) => findMoves(board, side, buf),
    doJump: (side, jump) => doJump(board, side, jump),
    doMove: (side, move) => doMove(board, side, move),
    doPlay: (side, play) => doPlay(board, side, play),
    buildTree: (side, buf = []) => buildTree(board, side, buf),
  };
}
