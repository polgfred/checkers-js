/* eslint-disable no-console */
import { describe, expect, it } from 'bun:test';

import { hrtime } from 'process';

import { SideType } from './types';
import { makeRules } from './rules';
import { analyze } from './analyzer';
import { copyBoard, newBoard, reverseBoard } from './utils';

const { RED, WHT } = SideType;

function duration(action: () => void, times: number) {
  const start = hrtime.bigint();
  for (let i = 0; i < times; ++i) {
    action();
  }
  const end = hrtime.bigint();
  return end - start;
}

describe('Performance', () => {
  describe('moves', () => {
    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard(), RED);
      const nsec = duration(findMoves, 1_000_000);
      console.log('findMoves', nsec);
      expect(nsec).toBeGreaterThan(0);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(newBoard(), RED);
      const nsec = duration(findJumps, 1_000_000);
      console.log('findJumps', nsec);
      expect(nsec).toBeGreaterThan(0);
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

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(copyBoard(initialData), RED);
      const nsec = duration(findJumps, 1_000_000);
      console.log('findJumps', nsec);
      expect(nsec).toBeGreaterThan(0);
    });
  });

  describe('analyzer', () => {
    // prettier-ignore
    const initialData = reverseBoard([
      [ 0,  0,  0, -1,  0, -1,  0,  0 ],
      [-1,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0, -1,  0,  0,  0,  0 ],
      [ 1,  0,  1,  0,  0,  0, -1,  0 ],
      [ 0,  1,  0,  0,  0, -1,  0,  0 ],
      [ 1,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  1 ],
      [ 0,  0,  0,  0, -2,  0,  1,  0 ],
    ]);

    it('should return a move and score from this position', () => {
      const start = hrtime.bigint();
      const [, move] = analyze(copyBoard(initialData), WHT);
      const end = hrtime.bigint();
      console.log('analyze', end - start);
      expect(move).toEqual([
        [5, 7],
        [4, 6],
      ]);
    });
  });
});
