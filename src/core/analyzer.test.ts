import { analyze } from './analyzer';
import { newBoardFromData } from './utils';

describe('Analyzer', () => {
  describe('with a contrived multi-jump position', () => {
    const initialBoard = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, -1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, -1, 0, -1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, -1, 0, -1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0],
    ].reverse();

    it('should find the best play from this position', () => {
      expect(analyze(newBoardFromData(initialBoard), 1)[0]).toEqual([
        [2, 0],
        [4, 2, 3, 1],
        [6, 4, 5, 3],
        [4, 6, 5, 5],
      ]);
    });

    it('should find the best score from this position', () => {
      expect(analyze(newBoardFromData(initialBoard), 1)[1]).toBeLessThan(0);
    });
  });
});
