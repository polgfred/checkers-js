import { copyBoard } from './utils';

import {
  BoardType,
  MoveType,
  SideType,
  PieceType,
  TreeType,
  isPieceOf,
  isKingOf,
  _MutableMoveType,
} from './types';

const { RED } = SideType;
const { EMPTY } = PieceType;

export type Rules = {
  readonly getBoard: () => BoardType;
  readonly getSide: () => SideType;
  readonly findJumps: () => readonly MoveType[];
  readonly findMoves: () => readonly MoveType[];
  readonly findPlays: () => readonly MoveType[];
  readonly doJump: (jump: MoveType) => () => void;
  readonly doMove: (move: MoveType) => () => void;
  readonly doPlay: (play: MoveType) => () => void;
  readonly buildTree: () => TreeType;
};

export function makeRules(_board: BoardType, side: SideType): Rules {
  // don't mutate the caller's board
  const board = copyBoard(_board);

  function findJumps(): readonly MoveType[] {
    const top = side === RED ? 7 : 0;
    const out = top + side;
    const bottom = top ^ 7;
    const jumps = [] as MoveType[];

    // loop through playable squares
    for (let y = bottom; y !== out; y += side) {
      for (let x = bottom; x !== out; x += side) {
        // see if it's our piece
        const p: PieceType = board[y][x];

        if (side === RED ? p > 0 : p < 0) {
          // checking for jumps is inherently recursive - as long as you find them,
          // you have to keep looking, and only termimal positions are valid
          nextJump([[x, y]], jumps);
        }
      }
    }

    return jumps;
  }

  function nextJump(cur: _MutableMoveType, jumps: MoveType[]) {
    const [x, y] = cur[cur.length - 1];
    const p: PieceType = board[y][x];
    const top = side === RED ? 7 : 0;
    const king = isKingOf(side, p);
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
          const m: PieceType = board[my][mx];
          const n: PieceType = board[ny][nx];

          // see if the middle piece is an opponent and the landing is open
          if (n === EMPTY && (side === RED ? m < 0 : m > 0)) {
            const crowned = !king && ny === top;
            found = true;

            // keep track of the coordinates, and move the piece
            board[y][x] = EMPTY;
            board[my][mx] = EMPTY;
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
            board[ny][nx] = EMPTY;
          }
        }
      }
    }

    // return whether more jumps were found from this position
    return found;
  }

  function doJump(jump: MoveType): () => void {
    const len = jump.length;
    const [x, y] = jump[0];
    const [fx, fy] = jump[len - 1];
    const p: PieceType = board[y][x];
    const top = side === RED ? 7 : 0;
    const crowned = isPieceOf(side, p) && fy === top;
    const cap = new Array(len) as number[];

    // remove the initial piece
    cap[0] = p;
    board[y][x] = EMPTY;

    // loop over the passed in coords
    for (let i = 1; i < len; ++i) {
      const [, , mx, my] = jump[i];

      // perform the jump
      cap[i] = board[my][mx];
      board[my][mx] = EMPTY;
    }

    // final piece
    board[fy][fx] = crowned ? p << 1 : p;

    // switch sides
    side = -side;

    // reverse the jump
    return () => {
      // remove the final piece
      board[fy][fx] = EMPTY;

      // loop over the passed in coords in reverse
      for (let i = len - 1; i > 0; --i) {
        const [, , mx, my] = jump[i];

        // put back the captured piece
        board[my][mx] = cap[i];
      }

      // put back initial piece
      board[y][x] = p;

      // switch back to original side
      side = -side;
    };
  }

  function findMoves(): readonly MoveType[] {
    const top = side === RED ? 7 : 0;
    const out = top + side;
    const bottom = top ^ 7;
    const moves = [] as MoveType[];

    // loop through playable squares
    for (let y = bottom; y !== out; y += side) {
      for (let x = bottom; x !== out; x += side) {
        const p: PieceType = board[y][x];
        const king = isKingOf(side, p);

        // see if it's our piece
        if (side === RED ? p > 0 : p < 0) {
          // loop over directions (dx, dy) from the current square
          for (let dy = king ? -1 : 1; dy !== 3; dy += 2) {
            for (let dx = -1; dx !== 3; dx += 2) {
              let nx: number;
              let ny: number;

              // calculate landing coordinates
              if (side === RED) {
                nx = x + dx;
                ny = y + dy;
              } else {
                nx = x - dx;
                ny = y - dy;
              }

              // see if move is on the board
              if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                // see if the landing is open
                if (board[ny][nx] === EMPTY) {
                  moves.push([
                    [x, y],
                    [nx, ny],
                  ]);
                }
              }
            }
          }
        }
      }
    }

    return moves;
  }

  function doMove(move: MoveType): () => void {
    const [[x, y], [nx, ny]] = move;
    const p: PieceType = board[y][x];
    const top = side === RED ? 7 : 0;
    const crowned = isPieceOf(side, p) && ny === top;

    // perform the jump
    board[y][x] = EMPTY;
    board[ny][nx] = crowned ? p << 1 : p;

    // switch sides
    side = -side;

    // reverse the move
    return () => {
      // put things back where we found them
      board[ny][nx] = EMPTY;
      board[y][x] = p;

      // switch back
      side = -side;
    };
  }

  function findPlays(): readonly MoveType[] {
    // you have to jump if you can
    const jumps = findJumps();
    if (jumps.length) {
      return jumps;
    } else {
      return findMoves();
    }
  }

  function doPlay(play: MoveType): () => void {
    // if the second segment has coords for the jumped piece,
    // it has to be a jump
    if (play[1].length > 2) {
      return doJump(play);
    } else {
      return doMove(play);
    }
  }

  function buildTree(): TreeType {
    const plays = findPlays();
    const tree: TreeType = {};

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
    findMoves,
    findPlays,
    doJump,
    doMove,
    doPlay,
    buildTree,
  };
}
