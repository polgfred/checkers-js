/* eslint-disable no-console */
import process from 'process';

import { SideType } from './types';
import { makeRules } from './rules';
import { analyze } from './analyzer';
import { copyBoard, newBoard, reverseBoard } from './utils';

const { RED, WHT } = SideType;

function duration(action: () => void, times: number) {
  const start = process.hrtime();
  for (let i = 0; i < times; ++i) {
    action();
  }
  return process.hrtime(start);
}

describe('Performance', () => {
  describe('moves', () => {
    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard(), RED);
      const [sec, nsec] = duration(findMoves, 1000);
      console.log('findMoves', sec + nsec / 1e9);
      expect(sec * 1e9 + nsec).toBeGreaterThan(0);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(newBoard(), RED);
      const [sec, nsec] = duration(findJumps, 1000);
      console.log('findJumps', sec + nsec / 1e9);
      expect(sec * 1e9 + nsec).toBeGreaterThan(0);
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
      const [sec, nsec] = duration(findJumps, 1000);
      console.log('findJumps', sec + nsec / 1e9);
      expect(sec * 1e9 + nsec).toBeGreaterThan(0);
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
      const start = process.hrtime();
      const [move] = analyze(copyBoard(initialData), WHT);
      const [sec, nsec] = process.hrtime(start);
      console.log('analyze', sec + nsec / 1e9);
      expect(move).toEqual([
        [3, 7],
        [2, 6],
      ]);
    });
  });
});
