import {
  SideType,
  PieceType,
  type BoardType,
  type JumpStepType,
  type JumpType,
  type MoveType,
  type PlayType,
  type StartType,
  type TreeType,
} from './types';

const { RED } = SideType;
const { EMPTY, RED_PIECE, RED_KING, WHT_PIECE, WHT_KING } = PieceType;

export type MoveGenerator = Generator<PlayType, void, void>;

type JumpBuild = [StartType, ...JumpStepType[]];

export interface Rules {
  board: BoardType;
  readonly findJumps: (side: SideType) => MoveGenerator;
  readonly findMoves: (side: SideType) => MoveGenerator;
  readonly findPlays: (side: SideType) => MoveGenerator;
  readonly doJump: (side: SideType, jump: JumpType) => void;
  readonly doMove: (side: SideType, move: MoveType) => void;
  readonly doPlay: (side: SideType, play: PlayType) => void;
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
  const bottom = side === RED ? 0 : 7;

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      // see if it's our piece
      const p = board[y][x];

      if (isFriendly(side, p)) {
        // checking for jumps is inherently recursive - as long as you find them,
        // you have to keep looking, and only termimal positions are valid
        const start = [x, y] as const;
        yield* nextJumps([start]);
      }
    }
  }

  function* nextJumps(cur: JumpBuild): MoveGenerator {
    const [x, y] = cur[cur.length - 1];
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
            cur.push([nx, ny, mx, my]);
            board[y][x] = EMPTY;
            board[my][mx] = EMPTY;
            board[ny][nx] = crowned ? crownPiece(p) : p;

            // if we're crowned, don't look any further
            if (!crowned) {
              // see if there are any further jumps from here
              for (const j of nextJumps(cur)) {
                found = true;
                yield j;
              }
            }

            // we're at a terminal position
            if (!found) {
              const snapshot = cur.slice() as JumpBuild;
              const [start, first, ...rest] = snapshot;
              yield {
                kind: 'jump',
                start,
                steps: [first, ...rest],
              };
            }
          } finally {
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
}

function* findMoves(board: BoardType, side: SideType): MoveGenerator {
  const bottom = side === RED ? 0 : 7;

  // loop through playable squares
  for (let y = bottom; inBounds(y); y += side) {
    for (let x = bottom; inBounds(x); x += side) {
      const p = board[y][x];
      const cur = [x, y] as const;

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

                const next = [nx, ny] as const;
                yield {
                  kind: 'move',
                  start: cur,
                  end: next,
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
  if (!found) {
    for (const move of findMoves(board, side)) {
      yield move;
    }
  }
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

function buildTree(board: BoardType, side: SideType) {
  const tree = {} as TreeType;

  function addPath(coords: readonly StartType[]) {
    let node = tree;
    for (const [x, y] of coords) {
      const key = `${x},${y}`;
      node[key] ??= {};
      node = node[key];
    }
  }

  function playToCoords(play: PlayType): StartType[] {
    switch (play.kind) {
      case 'move':
        return [play.start, play.end];
      case 'jump':
        return [play.start, ...play.steps.map(([x, y]) => [x, y] as const)];
    }
  }

  for (const play of findPlays(board, side)) {
    addPath(playToCoords(play));
  }

  return tree;
}

// `board` will be mutated by the rules engine, so make a copy first
export function makeRules(board: BoardType): Rules {
  return {
    board,
    findJumps: (side: SideType) => findJumps(board, side),
    findMoves: (side: SideType) => findMoves(board, side),
    findPlays: (side: SideType) => findPlays(board, side),
    doJump: (side: SideType, jump: JumpType) => doJump(board, side, jump),
    doMove: (side: SideType, move: MoveType) => doMove(board, side, move),
    doPlay: (side: SideType, play: PlayType) => doPlay(board, side, play),
    buildTree: (side: SideType) => buildTree(board, side),
  };
}
