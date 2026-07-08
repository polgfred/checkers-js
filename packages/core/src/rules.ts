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

export type MoveGenerator = Generator<PlayType, void, void>;

export interface Rules {
  board: BoardType;
  readonly findJumps: (side: SideType) => MoveGenerator;
  readonly findMoves: (side: SideType) => MoveGenerator;
  readonly iteratePlays: (plays: PlayType[]) => MoveGenerator;
  readonly doJump: (jump: JumpType) => void;
  readonly doMove: (move: MoveType) => void;
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

function isCrowned(piece: PieceType, ny: number): boolean {
  switch (piece) {
    case RED_PIECE:
      return ny === 7;
    case WHT_PIECE:
      return ny === 0;
    default:
      return false;
  }
}

function* findJumps(board: BoardType, side: SideType): MoveGenerator {
  const bottom = side === RED ? 0 : 7;

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      // see if it's our piece
      const p = board[y][x];

      if (isFriendly(side, p)) {
        // checking for jumps is inherently recursive - as long as you find them,
        // you have to keep looking, and only termimal positions are valid
        yield* nextJumps(board, side, x, y, {
          kind: 'jump',
          start: [x, y],
          steps: [],
        });
      }
    }
  }
}

function* nextJumps(
  board: BoardType,
  side: SideType,
  x: number,
  y: number,
  jump: JumpType
): MoveGenerator {
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
        const crowned = isCrowned(p, ny);
        const next: JumpType = {
          kind: 'jump',
          start: jump.start,
          steps: [...jump.steps, [nx, ny, mx, my]],
        };
        let found = false;

        // keep track of the coordinates, and move the piece
        try {
          board[y][x] = EMPTY;
          board[my][mx] = EMPTY;
          board[ny][nx] = crowned ? crownPiece(p) : p;

          // if we're crowned, don't look any further
          if (!crowned) {
            // see if there are any further jumps from here
            for (const j of nextJumps(board, side, nx, ny, next)) {
              found = true;
              yield j;
            }
          }

          // we're at a terminal position
          if (!found) yield next;
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

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      const p = board[y][x];

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
              const crowned = isCrowned(p, ny);

              try {
                // move the piece
                board[y][x] = EMPTY;
                board[ny][nx] = crowned ? crownPiece(p) : p;
                yield {
                  kind: 'move',
                  start: [x, y],
                  end: [nx, ny],
                };
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

function* findPlays(board: BoardType, side: SideType) {
  // you have to jump if you can
  let found = false;
  for (const jump of findJumps(board, side)) {
    found = true;
    yield jump;
  }
  if (!found) yield* findMoves(board, side);
}

function* iteratePlays(
  board: BoardType,
  plays: readonly PlayType[]
): MoveGenerator {
  for (const play of plays) {
    switch (play.kind) {
      case 'jump':
        yield* iterateJump(board, play, 0);
        break;
      case 'move':
        yield* iterateMove(board, play);
        break;
    }
  }
}

function* iterateJump(
  board: BoardType,
  jump: JumpType,
  step: number
): MoveGenerator {
  const [x, y] = step === 0 ? jump.start : jump.steps[step - 1];
  const [nx, ny, mx, my] = jump.steps[step];
  const p = board[y][x];
  const mp = board[my][mx];
  const np = isCrowned(p, ny) ? crownPiece(p) : p;

  board[y][x] = EMPTY;
  board[my][mx] = EMPTY;
  board[ny][nx] = np;

  try {
    if (step === jump.steps.length - 1) yield jump;
    else yield* iterateJump(board, jump, step + 1);
  } finally {
    board[y][x] = p;
    board[my][mx] = mp;
    board[ny][nx] = EMPTY;
  }
}

function* iterateMove(board: BoardType, move: MoveType): MoveGenerator {
  const [x, y] = move.start;
  const [nx, ny] = move.end;
  const p = board[y][x];
  const np = isCrowned(p, ny) ? crownPiece(p) : p;

  board[y][x] = EMPTY;
  board[ny][nx] = np;

  try {
    yield move;
  } finally {
    board[y][x] = p;
    board[ny][nx] = EMPTY;
  }
}

function doJump(board: BoardType, jump: JumpType) {
  const [x, y] = jump.start;
  const [fx, fy] = jump.steps[jump.steps.length - 1];
  const p = board[y][x];

  board[y][x] = EMPTY;
  for (const [, , mx, my] of jump.steps) board[my][mx] = EMPTY;
  board[fy][fx] = isCrowned(p, fy) ? crownPiece(p) : p;
}

function doMove(board: BoardType, move: MoveType) {
  const [x, y] = move.start;
  const [nx, ny] = move.end;
  const p = board[y][x];

  board[y][x] = EMPTY;
  board[ny][nx] = isCrowned(p, ny) ? crownPiece(p) : p;
}

function buildTree(board: BoardType, side: SideType) {
  const tree = {} as TreeType;

  for (const play of findPlays(board, side)) {
    let node = tree;
    // starting coords
    const [x, y] = play.start;
    const key = `${x},${y}`;
    node[key] ??= {};
    node = node[key];
    // leg/ending coords
    for (const [nx, ny] of play.kind === 'jump' ? play.steps : [play.end]) {
      const key = `${nx},${ny}`;
      node[key] ??= {};
      node = node[key];
    }
  }

  return tree;
}

// `board` will be mutated by the rules engine, so make a copy first
export function makeRules(board: BoardType): Rules {
  return {
    board,
    findJumps: (side) => findJumps(board, side),
    findMoves: (side) => findMoves(board, side),
    iteratePlays: (plays) => iteratePlays(board, plays),
    doJump: (jump) => doJump(board, jump),
    doMove: (move) => doMove(board, move),
    buildTree: (side) => buildTree(board, side),
  };
}
