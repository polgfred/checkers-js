/* eslint-disable no-console */

import { makeRules } from './rules';
import { newBoard, newBoardFromData } from './utils';

describe('Performance', () => {
  describe('moves', () => {
    let rules;

    beforeEach(() => {
      rules = makeRules(newBoard(), 1);
    });

    it('should find the moves from this position', () => {
      let plays;
      console.time('moves');
      for (let i = 1000; i; --i) {
        plays = rules.findMoves();
      }
      console.timeEnd('moves');

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
      let plays;
      console.time('jumps');
      for (let i = 1000; i; --i) {
        plays = rules.findJumps();
      }
      console.timeEnd('jumps');

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

    it('should find the jumps from this position', () => {
      let plays;
      console.time('jumps');
      for (let i = 1000; i; --i) {
        plays = rules.findJumps();
      }
      console.timeEnd('jumps');

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
  });
});
