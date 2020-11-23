import { Rules, makeRules } from './rules';
import { newBoard, newBoardFromData } from './utils';

describe('Rules', () => {
  describe('moves', () => {
    let rules: Rules;

    beforeEach(() => {
      rules = makeRules(newBoard(), 1);
    });

    it('should initialize the board', () => {
      expect(rules.board()[0][0]).toBe(1);
    });

    it('should initialize the side', () => {
      expect(rules.side()).toBe(1);
    });

    it('should find the moves from this position', () => {
      const plays = rules.findMoves();

      expect(plays.length).toBe(7);
      expect(plays).toEqual([
        [
          [0, 2],
          [1, 3],
        ],
        [
          [2, 2],
          [1, 3],
        ],
        [
          [2, 2],
          [3, 3],
        ],
        [
          [4, 2],
          [3, 3],
        ],
        [
          [4, 2],
          [5, 3],
        ],
        [
          [6, 2],
          [5, 3],
        ],
        [
          [6, 2],
          [7, 3],
        ],
      ]);
    });

    it('should find the jumps from this position', () => {
      const plays = rules.findJumps();

      expect(plays.length).toBe(0);
    });
  });

  describe('jumps', () => {
    let rules;

    beforeEach(() => {
      rules = makeRules(
        newBoardFromData(
          [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, -1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, -1, 0, -1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, -1, 0, -1, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0],
          ].reverse()
        ),
        1
      );
    });

    it('should initialize the board', () => {
      expect(rules.board()[0][0]).toBe(0);
    });

    it('should initialize the side', () => {
      expect(rules.side()).toBe(1);
    });

    it('should find the jumps from this position', () => {
      const plays = rules.findJumps();

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
      const plays = rules.buildTree();

      expect(plays['2,0']['4,2']['6,4']['4,6']).toEqual({});
      expect(plays['2,0']['4,2']['2,4']).toEqual({});
      expect(plays['2,0']['0,2']).toEqual({});
    });
  });
});
