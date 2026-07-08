import { describe, expect, it } from 'vitest';

import { convertPlay, makeRules, type Collector } from './rules';
import { PieceType, SideType, type BoardType } from './types';
import { copyBoard, dumpBoard, newBoard, reverseBoard } from './utils';

const { RED } = SideType;
const { EMPTY, RED_PIECE, RED_KING } = PieceType;

// findJumps/findMoves reuse a single scratch buffer, so snapshot each yielded
// play into its own array to get a list of pre-calculated plays.
function snapshot(source: Iterable<Collector>): Collector[] {
  const plays: Collector[] = [];
  for (const play of source) plays.push([...play]);
  return plays;
}

describe('Rules', () => {
  describe('moves', () => {
    it('should initialize the board', () => {
      const { board } = makeRules(newBoard());
      expect(board[0][0]).toBe(RED_PIECE);
    });

    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard());
      const moves = [...findMoves(RED).map(convertPlay)];

      expect(moves.length).toBe(7);
      // prettier-ignore
      expect(moves).toEqual([
        { kind: 'move', start: [0, 2], end: [1, 3] },
        { kind: 'move', start: [2, 2], end: [1, 3] },
        { kind: 'move', start: [2, 2], end: [3, 3] },
        { kind: 'move', start: [4, 2], end: [3, 3] },
        { kind: 'move', start: [4, 2], end: [5, 3] },
        { kind: 'move', start: [6, 2], end: [5, 3] },
        { kind: 'move', start: [6, 2], end: [7, 3] },
      ]);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(newBoard());
      const jumps = [...findJumps(RED).map(convertPlay)];

      expect(jumps.length).toBe(0);
    });
  });

  describe('jumps', () => {
    // prettier-ignore
    const initialData = reverseBoard([
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0, -1,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0, -1,  0, -1,  0,  0,  0,  0 ],
      [ 0,  0,  1,  0,  0,  0,  0,  0 ],
    ]);

    it('should initialize the board', () => {
      const { board } = makeRules(copyBoard(initialData));
      expect(board[0][0]).toBe(EMPTY);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(copyBoard(initialData));
      const jumps = [...findJumps(RED).map(convertPlay)];

      expect(jumps.length).toBe(3);
      expect(jumps).toEqual([
        { kind: 'jump', start: [2, 0], steps: [[0, 2, 1, 1]] },
        {
          kind: 'jump',
          start: [2, 0],
          steps: [
            [4, 2, 3, 1],
            [2, 4, 3, 3],
          ],
        },
        {
          kind: 'jump',
          start: [2, 0],
          steps: [
            [4, 2, 3, 1],
            [6, 4, 5, 3],
            [4, 6, 5, 5],
          ],
        },
      ]);
    });

    it('should build a jump tree from this position', () => {
      const { buildTree } = makeRules(copyBoard(initialData));
      const plays = buildTree(RED);

      expect(plays).toEqual({
        '2,0': {
          '4,2': {
            '6,4': {
              '4,6': {},
            },
            '2,4': {},
          },
          '0,2': {},
        },
      });
    });
  });

  describe('iteratePlays', () => {
    // reused from the jumps block: 3 jumps from (2,0), including a 3-leg jump.
    // prettier-ignore
    const jumpData = reverseBoard([
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0, -1,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0, -1,  0, -1,  0,  0,  0,  0 ],
      [ 0,  0,  1,  0,  0,  0,  0,  0 ],
    ]);

    it('should replay the same moves that findMoves produced', () => {
      const { findMoves, iteratePlays } = makeRules(newBoard());
      const plays = snapshot(findMoves(RED));

      const iterated = [...iteratePlays(RED, plays)].map(convertPlay);
      expect(iterated).toEqual(plays.map(convertPlay));
    });

    it('should replay the same jumps that findJumps produced, including multi-leg', () => {
      const { findJumps, iteratePlays } = makeRules(copyBoard(jumpData));
      const plays = snapshot(findJumps(RED));

      // sanity: we're actually exercising a multi-leg jump (the 3-leg one)
      expect(Math.max(...plays.map((p) => p.length))).toBeGreaterThan(5);

      const iterated = [...iteratePlays(RED, plays)].map(convertPlay);
      expect(iterated).toEqual(plays.map(convertPlay));
    });

    it('should restore the board after iterating all the plays', () => {
      const board = copyBoard(jumpData);
      const before = dumpBoard(board);
      const { findJumps, iteratePlays } = makeRules(board);
      const plays = snapshot(findJumps(RED));

      // drain the generator
      for (const _ of iteratePlays(RED, plays)) {
        /* execute each play in turn */
      }

      expect(dumpBoard(board)).toBe(before);
    });

    it('should present the executed position at yield time (matches doJump/doMove)', () => {
      const board = copyBoard(jumpData);
      const { findJumps, iteratePlays } = makeRules(board);
      const plays = snapshot(findJumps(RED));

      let count = 0;
      for (const coll of iteratePlays(RED, plays)) {
        const play = convertPlay(coll);

        // oracle: apply the same play to a fresh board via doJump/doMove
        const oracle = makeRules(copyBoard(jumpData));
        if (play.kind === 'jump') oracle.doJump(play);
        else oracle.doMove(play);

        expect(dumpBoard(board)).toBe(dumpBoard(oracle.board));
        count++;
      }

      expect(count).toBe(plays.length);
    });

    it('should crown a piece that reaches the back rank at yield time, then restore it', () => {
      // board[y][x]: a lone RED piece one row below its back rank (y=7)
      // prettier-ignore
      const crownData = [
        [ 0, 0, 0, 0, 0, 0, 0, 0 ], // y=0
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 1, 0, 0, 0, 0, 0 ], // y=6, x=2: RED_PIECE
        [ 0, 0, 0, 0, 0, 0, 0, 0 ], // y=7: back rank
      ] as unknown as BoardType;

      const board = copyBoard(crownData);
      const { findMoves, iteratePlays } = makeRules(board);
      const plays = snapshot(findMoves(RED));

      for (const coll of iteratePlays(RED, plays)) {
        const play = convertPlay(coll);
        expect(play.kind).toBe('move');
        if (play.kind !== 'move') continue;
        const [nx, ny] = play.end;
        // every landing is the back rank here, so the piece is crowned
        expect(ny).toBe(7);
        expect(board[ny][nx]).toBe(RED_KING);
      }

      // ...and the piece is back to an uncrowned piece once iteration unwinds
      expect(board[6][2]).toBe(RED_PIECE);
      expect(board[7][1]).toBe(EMPTY);
      expect(board[7][3]).toBe(EMPTY);
    });
  });
});
