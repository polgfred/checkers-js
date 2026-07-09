/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { hrtime } from 'node:process';

import { describe, expect, it } from 'vitest';

import { analyze } from './analyzer';
import { makeRules } from './rules';
import { SideType } from './types';
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
  describe('initial setup', () => {
    it('should find the moves from this position', () => {
      const { findMoves } = makeRules(newBoard());
      const nsec = duration(() => {
        for (const _ of findMoves(RED)) {
          // consume generator to measure actual move generation cost
        }
      }, 1_000_000);
      console.log('findMoves', nsec);
      expect(nsec).toBeGreaterThan(0);
    });

    it('should find the jumps from this position', () => {
      const { findJumps } = makeRules(newBoard());
      const nsec = duration(() => {
        for (const _ of findJumps(RED)) {
          // consume generator to measure actual jump generation cost
        }
      }, 1_000_000);
      console.log('findJumps', nsec);
      expect(nsec).toBeGreaterThan(0);
    });
  });

  describe('contrived multi-jump position', () => {
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
      const { findJumps } = makeRules(copyBoard(initialData));
      const nsec = duration(() => {
        for (const _ of findJumps(RED)) {
          // consume generator to measure actual jump generation cost
        }
      }, 1_000_000);
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
      const [, move] = analyze(copyBoard(initialData), WHT, 12);
      const end = hrtime.bigint();
      console.log('analyze', end - start);
      expect(move).toEqual({
        kind: 'move',
        start: [5, 7],
        end: [4, 6],
      });
    });
  });
});
