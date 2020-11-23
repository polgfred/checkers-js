/* eslint-disable no-console */
import process from 'process';
import { makeRules } from './rules';
import { newBoard, newBoardFromData } from './utils';

function duration(
  action: () => void,
  times: number
): [sec: number, nsec: number] {
  const start = process.hrtime();
  for (let i = 0; i < times; ++i) {
    action();
  }
  return process.hrtime(start);
}

describe('Performance', () => {
  describe('moves', () => {
    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard(), 1);
      const [sec, nsec] = duration(findMoves, 1000);
      console.log(`findMoves: ${sec}s ${nsec}ns`);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(newBoard(), 1);
      const [sec, nsec] = duration(findJumps, 1000);
      console.log(`findJumps: ${sec}s ${nsec}ns`);
    });
  });

  describe('jumps', () => {
    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(
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

      const [sec, nsec] = duration(findJumps, 1000);
      console.log(`findJumps: ${sec}s ${nsec}ns`);
    });
  });
});
