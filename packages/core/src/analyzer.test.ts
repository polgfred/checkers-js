import { describe, expect, it } from 'vitest';

import { analyze, mateInfo } from './analyzer';
import { SideType, type BoardType } from './types';
import { copyBoard, reverseBoard } from './utils';

const { RED, WHT } = SideType;

describe('Analyzer', () => {
  describe('with a contrived multi-jump position', () => {
    // prettier-ignore
    const redToJump = reverseBoard([
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
      const [score, move] = analyze(copyBoard(redToJump), RED);
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

  describe('with an easy endgame position', () => {
    // prettier-ignore
    const lostForRed = reverseBoard([
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0, -2,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  2,  0,  0,  0 ],
    ]);

    it('should find the best play from this position', () => {
      const [score, move] = analyze(copyBoard(lostForRed), WHT);
      // both (4,2) and (6,2) are forced wins at this depth; (4,2) mates sooner,
      // so mate-distance scoring must prefer it
      expect(move).toEqual({
        kind: 'move',
        start: [5, 3],
        end: [4, 2],
      });
      expect(mateInfo(score)).toMatchObject({ result: 'win', plies: 3 });
    });
  });

  describe('with a forced win for the side to move', () => {
    // prettier-ignore
    const lostForWhite = reverseBoard([
      [ 0,  0,  0,  0, -2,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  2,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
    ]);

    it('sees the win for red, whose mate lands deep in the tree', () => {
      // mirror of the endgame above (colors swapped, board flipped)
      const [score, move] = analyze(copyBoard(lostForWhite), RED);
      expect(move).toBeDefined();
      expect(mateInfo(score)).toMatchObject({ result: 'win', plies: 3 });
    });
  });

  it('should score a side with no legal plays as a loss at the depth boundary', () => {
    // prettier-ignore
    const emptyBoard: BoardType = [
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
    ];

    // no plays => the side to move is mated, i.e. a loss from its own perspective
    const redMate = mateInfo(analyze(copyBoard(emptyBoard), RED, 0)[0]);
    const whiteMate = mateInfo(analyze(copyBoard(emptyBoard), WHT, 0)[0]);
    expect(redMate?.result).toBe('loss');
    expect(whiteMate?.result).toBe('loss');
  });

  it('returns a legal move for a losing-but-playable side', () => {
    // white king (6,2) has red king (4,0) in a lost endgame; red must still
    // report one of its legal moves rather than undefined (no false stalemate)
    // prettier-ignore
    const lostForRed = reverseBoard([
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0, -2,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  2,  0,  0,  0 ],
    ]);

    const [, move] = analyze(copyBoard(lostForRed), RED);
    expect(move).toBeDefined();
  });
});
