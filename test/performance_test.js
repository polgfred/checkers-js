/* eslint-disable no-console */

import expect from 'expect.js';

import Rules from '../src/core/rules';
import { newBoard, newBoardFromData } from '../src/core/utils';

describe('Performance', () => {
  describe('moves', () => {
    let rules;

    before(() => {
      rules = new Rules(newBoard(), +1);
    });

    it('should find the moves from this position', () => {
      let plays;
      console.time('moves');
      for (let i = 1000; i; --i) {
        plays = rules.findMoves();
      }
      console.timeEnd('moves');

      expect(plays.length).to.be(7);
      expect(plays).to.eql([
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
      let plays;
      console.time('jumps');
      for (let i = 1000; i; --i) {
        plays = rules.findJumps();
      }
      console.timeEnd('jumps');

      expect(plays.length).to.be(0);
    });
  });

  describe('jumps', () => {
    let rules;

    before(() => {
      rules = new Rules(
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
        +1
      );
    });

    it('should find the jumps from this position', () => {
      let plays;
      console.time('jumps');
      for (let i = 1000; i; --i) {
        plays = rules.findJumps();
      }
      console.timeEnd('jumps');

      expect(plays.length).to.be(3);
      expect(plays).to.eql([
        [[2, 0], [0, 2, 1, 1]],
        [[2, 0], [4, 2, 3, 1], [2, 4, 3, 3]],
        [[2, 0], [4, 2, 3, 1], [6, 4, 5, 3], [4, 6, 5, 5]],
      ]);
    });
  });
});
