import { describe, expect, it } from 'vitest';

import { convertBuffer, makeRules } from './rules';
import { PieceType, SideType } from './types';
import { copyBoard, newBoard, reverseBoard } from './utils';

const { RED } = SideType;
const { EMPTY, RED_PIECE } = PieceType;

describe('Rules', () => {
  describe('moves', () => {
    it('should initialize the board', () => {
      const { board } = makeRules(newBoard());
      expect(board[0][0]).toBe(RED_PIECE);
    });

    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard());
      const moves = [...findMoves(RED).map(convertBuffer)];

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
      const jumps = [...findJumps(RED).map(convertBuffer)];

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
      const jumps = [...findJumps(RED).map(convertBuffer)];

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
});
