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

// `board` will be mutated by the rules engine, so make a copy first
export function makeRules(board: BoardType, side: SideType): Rules {
  function switchSides() {
    switch (side) {
      case RED:
        side = WHT;
        break;
      case WHT:
        side = RED;
        break;
    }
  }

  function getYDirs(p: PieceType): number[] {
    switch (p) {
      case RED_KING:
        return redBoth;
      case RED_PIECE:
        return redForward;
      case WHT_KING:
        return whtBoth;
      case WHT_PIECE:
        return whtForward;
      default:
        return [];
    }
  }

  function getXDirs(p: PieceType): number[] {
    switch (p) {
      case RED_KING:
      case RED_PIECE:
        return redBoth;
      case WHT_KING:
      case WHT_PIECE:
        return whtBoth;
      default:
        return [];
    }
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
          const start = [x, y] as const;
          yield* nextJumps([start]);
        }
      }
    }
  }

  function* nextJumps(cur: JumpBuild): MoveGenerator {
    const [x, y] = cur[cur.length - 1];
    const p = board[y][x];
    const top = side === RED ? 7 : 0;
    const king = p === (side === RED ? RED_KING : WHT_KING);

    // loop over directions (dx, dy) from the current square
    for (const dy of getYDirs(p)) {
      for (const dx of getXDirs(p)) {
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
    for (let y = bottom; (y & ~7) === 0; y += side) {
      for (let x = bottom; (x & ~7) === 0; x += side) {
        const p = board[y][x];
        const top = side === RED ? 7 : 0;
        const king = p === (side === RED ? RED_KING : WHT_KING);
        const cur = [x, y] as const;

        // see if it's our piece
        if (side === RED ? p > 0 : p < 0) {
          // loop over directions (dx, dy) from the current square
          for (const dy of getYDirs(p)) {
            for (const dx of getXDirs(p)) {
              // calculate landing coordinates
              const nx = x + dx;
              const ny = y + dy;

              // see if move is on the board
              if (((nx | ny) & ~7) === 0) {
                // see if the landing is open
                if (board[ny][nx] === EMPTY) {
                  const crowned = !king && ny === top;

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
    const crowned =
      side === RED ? p === RED_PIECE && fy === 7 : p === WHT_PIECE && fy === 0;

    board[y][x] = EMPTY;
    for (const [, , mx, my] of jump.steps) {
      board[my][mx] = EMPTY;
    }
    board[fy][fx] = crowned ? ((p << 1) as PieceType) : p;
    side = -side as SideType;
  }

  function doMove(move: MoveType) {
    const [x, y] = move.start;
    const [nx, ny] = move.end;
    const p = board[y][x];
    const crowned =
      side === RED ? p === RED_PIECE && ny === 7 : p === WHT_PIECE && ny === 0;

    board[y][x] = EMPTY;
    board[ny][nx] = crowned ? ((p << 1) as PieceType) : p;
    side = -side as SideType;
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

    for (const play of findPlays()) {
      let root = tree;

      switch (play.kind) {
        case 'move': {
          {
            const [x, y] = play.start;
            const k = `${x},${y}`;
            root[k] = root[k] || {};
            root = root[k];
          }
          {
            const [x, y] = play.end;
            const k = `${x},${y}`;
            root[k] = root[k] || {};
            root = root[k];
          }
          break;
        }
        case 'jump': {
          {
            const [x, y] = play.start;
            const k = `${x},${y}`;
            root[k] = root[k] || {};
            root = root[k];
          }
          for (const [x, y] of play.steps) {
            const k = `${x},${y}`;
            root[k] = root[k] || {};
            root = root[k];
          }
          break;
        }
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
