import { makeRules } from './rules';
import { PieceType, SideType } from './types';
import { copyBoard, newBoard, reverseBoard } from './utils';

const { RED } = SideType;
const { EMPTY, RED_PIECE } = PieceType;

describe('Rules', () => {
  describe('moves', () => {
    it('should initialize the board', () => {
      const { getBoard } = makeRules(newBoard(), RED);
      const board = getBoard();
      expect(board[0][0]).toBe(RED_PIECE);
    });

    it('should initialize the side', () => {
      const { getSide } = makeRules(newBoard(), RED);
      const side = getSide();
      expect(side).toBe(RED);
    });

    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard(), RED);
      const moves = [...findMoves()];

      expect(moves.length).toBe(7);
      // prettier-ignore
      expect(moves).toEqual([
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
      const jumps = [...findJumps()];

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
      const { getBoard } = makeRules(copyBoard(initialData), RED);
      const board = getBoard();
      expect(board[0][0]).toBe(EMPTY);
    });

    it('should initialize the side', () => {
      const { getSide } = makeRules(copyBoard(initialData), RED);
      const side = getSide();
      expect(side).toBe(RED);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(copyBoard(initialData), RED);
      const jumps = [...findJumps()];

      expect(jumps.length).toBe(3);
      expect(jumps).toEqual([
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
      const { buildTree } = makeRules(copyBoard(initialData), RED);
      const plays = buildTree();

      expect(plays['2,0']['4,2']['6,4']['4,6']).toEqual({});
      expect(plays['2,0']['4,2']['2,4']).toEqual({});
      expect(plays['2,0']['0,2']).toEqual({});
    });
  });
});
