import { describe, expect, it } from 'bun:test';

import { analyze } from './analyzer';
import { SideType } from './types';
import { copyBoard, reverseBoard } from './utils';

const { RED } = SideType;

describe('Analyzer', () => {
  describe('with a contrived multi-jump position', () => {
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

    it('should find the best play from this position', () => {
      const [score, move] = analyze(copyBoard(initialData), RED);
      expect(move).toEqual([
        [2, 0],
        [4, 2, 3, 1],
        [6, 4, 5, 3],
        [4, 6, 5, 5],
      ]);
      expect(score).toBeLessThan(0);
    });
  });
});
