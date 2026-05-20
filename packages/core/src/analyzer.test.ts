import { describe, expect, it } from 'vitest';

import { analyze } from './analyzer';
import { PieceType, SideType, type BoardType } from './types';
import { copyBoard, reverseBoard } from './utils';

const { RED, WHT } = SideType;
const { EMPTY } = PieceType;

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
      expect(move).toEqual({
        kind: 'jump',
        start: [2, 0],
        steps: [
          [4, 2, 3, 1],
          [6, 4, 5, 3],
          [4, 6, 5, 5],
        ],
      });
      expect(score).toBeLessThan(0);
    });
  });

  it('should score a side with no legal plays as a loss at the depth boundary', () => {
    // prettier-ignore
    const emptyBoard: BoardType = [
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
      [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
    ];

    expect(analyze(copyBoard(emptyBoard), RED, 0)[0]).toBe(-Infinity);
    expect(analyze(copyBoard(emptyBoard), WHT, 0)[0]).toBe(Infinity);
  });
});
