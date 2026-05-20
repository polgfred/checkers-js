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

const { RED, WHT } = SideType;
const { EMPTY, RED_PIECE, RED_KING, WHT_PIECE, WHT_KING } = PieceType;

export type MoveGenerator = Generator<PlayType, void, void>;

type JumpBuild = [StartType, ...JumpStepType[]];

export interface Rules {
  readonly getBoard: () => BoardType;
  readonly getSide: () => SideType;
  readonly findJumps: () => MoveGenerator;
  readonly findMoves: () => MoveGenerator;
  readonly findPlays: () => MoveGenerator;
  readonly doJump: (jump: JumpType) => void;
  readonly doMove: (move: MoveType) => void;
  readonly doPlay: (play: PlayType) => void;
  readonly buildTree: () => TreeType;
}

// directions to scan while looking for moves
const redBoth = [-1, 1];
const whtBoth = [1, -1];
const redForward = [1];
const whtForward = [-1];

const emptyDirs = { dxs: [] as number[], dys: [] as number[] };

// `board` will be mutated by the rules engine, so make a copy first
export function makeRules(board: BoardType, side: SideType): Rules {
  function inBounds(n: number): boolean {
    return n >= 0 && n < 8;
  }

  function otherSide(s: SideType): SideType {
    return s === RED ? WHT : RED;
  }

  function isFriendly(p: PieceType): boolean {
    return side === RED ? p > 0 : p < 0;
  }

  function isEnemy(p: PieceType): boolean {
    return side === RED ? p < 0 : p > 0;
  }

  function getDirs(p: PieceType) {
    switch (p) {
      case RED_PIECE:
        return { dxs: redBoth, dys: redForward };
      case RED_KING:
        return { dxs: redBoth, dys: redBoth };
      case WHT_PIECE:
        return { dxs: whtBoth, dys: whtForward };
      case WHT_KING:
        return { dxs: whtBoth, dys: whtBoth };
      default:
        return emptyDirs;
    }
  }

  function switchSides() {
    side = otherSide(side);
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
    return side === RED
      ? p === RED_PIECE && ny === 7
      : p === WHT_PIECE && ny === 0;
  }

  function isKing(p: PieceType): boolean {
    return p === RED_KING || p === WHT_KING;
  }

  function* findJumps(): MoveGenerator {
    const bottom = side === RED ? 0 : 7;

    // loop through playable squares
    for (let y = bottom; inBounds(y); y += side) {
      for (let x = bottom; inBounds(x); x += side) {
        // see if it's our piece
        const p = board[y][x];

        if (isFriendly(p)) {
          // checking for jumps is inherently recursive - as long as you find them,
          // you have to keep looking, and only termimal positions are valid
          const start = [x, y] as const;
          yield* nextJumps([start]);
        }
      }
    }
  }

  function* nextJumps(cur: JumpBuild): MoveGenerator {
    const [x, y] = cur[cur.length - 1];
    const p = board[y][x];
    const { dxs, dys } = getDirs(p);

    // loop over directions (dx, dy) from the current square
    for (const dy of dys) {
      for (const dx of dxs) {
        // calculate middle and landing coordinates
        const mx = x + dx;
        const my = y + dy;
        const nx = mx + dx;
        const ny = my + dy;

        // see if jump is on the board
        if (inBounds(nx) && inBounds(ny)) {
          const m = board[my][mx];
          const n = board[ny][nx];

          // see if the middle piece is an opponent and the landing is open
          if (n === EMPTY && isEnemy(m)) {
            const crowned = !isKing(p) && isCrowned(p, ny);
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
                try {
                  switchSides();
                  const snapshot = cur.slice() as JumpBuild;
                  const [start, first, ...rest] = snapshot;
                  yield {
                    kind: 'jump',
                    start,
                    steps: [first, ...rest],
                  };
                } finally {
                  switchSides();
                }
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

  function* findMoves(): MoveGenerator {
    const bottom = side === RED ? 0 : 7;

    // loop through playable squares
    for (let y = bottom; inBounds(y); y += side) {
      for (let x = bottom; inBounds(x); x += side) {
        const p = board[y][x];
        const cur = [x, y] as const;
        const { dxs, dys } = getDirs(p);

        // see if it's our piece
        if (isFriendly(p)) {
          // loop over directions (dx, dy) from the current square
          for (const dy of dys) {
            for (const dx of dxs) {
              // calculate landing coordinates
              const nx = x + dx;
              const ny = y + dy;

              // see if move is on the board
              if (inBounds(nx) && inBounds(ny)) {
                // see if the landing is open
                if (board[ny][nx] === EMPTY) {
                  const crowned = !isKing(p) && isCrowned(p, ny);

                  try {
                    // move the piece
                    board[y][x] = EMPTY;
                    board[ny][nx] = crowned ? crownPiece(p) : p;
                    switchSides();

                    const next = [nx, ny] as const;
                    yield {
                      kind: 'move',
                      start: cur,
                      end: next,
                    };
                  } finally {
                    // put things back where we found them
                    switchSides();
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

  function doJump(jump: JumpType) {
    const [x, y] = jump.start;
    const [fx, fy] = jump.steps[jump.steps.length - 1];
    const p = board[y][x];
    const crowned = isCrowned(p, fy);

    board[y][x] = EMPTY;
    for (const [, , mx, my] of jump.steps) {
      board[my][mx] = EMPTY;
    }
    board[fy][fx] = crowned ? crownPiece(p) : p;
    side = otherSide(side);
  }

  function doMove(move: MoveType) {
    const [x, y] = move.start;
    const [nx, ny] = move.end;
    const p = board[y][x];
    const crowned = isCrowned(p, ny);

    board[y][x] = EMPTY;
    board[ny][nx] = crowned ? crownPiece(p) : p;
    side = otherSide(side);
  }

  function doPlay(play: PlayType) {
    switch (play.kind) {
      case 'jump':
        doJump(play);
        break;
      case 'move':
        doMove(play);
        break;
    }
  }

  function buildTree() {
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

    for (const play of findPlays()) {
      addPath(playToCoords(play));
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
