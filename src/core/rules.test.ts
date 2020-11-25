import { makeRules } from './rules';
import { SideType } from './types';
import { newBoard, newBoardFromData } from './utils';

const { RED } = SideType;

describe('Rules', () => {
  describe('moves', () => {
    it('should initialize the board', () => {
      const { getBoard } = makeRules(newBoard(), RED);
      const board = getBoard();
      expect(board[0][0]).toBe(1);
    });

    it('should initialize the side', () => {
      const { getSide } = makeRules(newBoard(), RED);
      const side = getSide();
      expect(side).toBe(1);
    });

    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard(), RED);
      const plays = findMoves();

      expect(plays.length).toBe(7);
      // prettier-ignore
      expect(plays).toEqual([
        [[0, 2], [1, 3]],
        [[2, 2], [1, 3]],
        [[2, 2], [3, 3]],
        [[4, 2], [3, 3]],
        [[4, 2], [5, 3]],
        [[6, 2], [5, 3]],
        [[6, 2], [7, 3]],
      ]);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(newBoard(), RED);
      const plays = findJumps();

      expect(plays.length).toBe(0);
    });
  });

  describe('jumps', () => {
    // prettier-ignore
    const initialData = [
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0, -1,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0, -1,  0, -1,  0,  0,  0,  0 ],
      [ 0,  0,  1,  0,  0,  0,  0,  0 ],
    ].reverse();

    it('should initialize the board', () => {
      const { getBoard } = makeRules(newBoardFromData(initialData), RED);
      const board = getBoard();
      expect(board[0][0]).toBe(0);
    });

    it('should initialize the side', () => {
      const { getSide } = makeRules(newBoardFromData(initialData), RED);
      const side = getSide();
      expect(side).toBe(1);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(newBoardFromData(initialData), RED);
      const plays = findJumps();

      expect(plays.length).toBe(3);
      expect(plays).toEqual([
        [
          [2, 0],
          [0, 2, 1, 1],
        ],
        [
          [2, 0],
          [4, 2, 3, 1],
          [2, 4, 3, 3],
        ],
        [
          [2, 0],
          [4, 2, 3, 1],
          [6, 4, 5, 3],
          [4, 6, 5, 5],
        ],
      ]);
    });

    it('should build a jump tree from this position', () => {
      const { buildTree } = makeRules(newBoardFromData(initialData), RED);
      const plays = buildTree();

      expect(plays['2,0']['4,2']['6,4']['4,6']).toEqual({});
      expect(plays['2,0']['4,2']['2,4']).toEqual({});
      expect(plays['2,0']['0,2']).toEqual({});
    });
  });
});
