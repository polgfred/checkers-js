import { analyze } from './analyzer';
import { newBoardFromData } from './utils';

describe('Analyzer', () => {
  describe('with a contrived multi-jump position', () => {
    // prettier-ignore
    const initialData = [
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0,  0,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0,  0,  0, -1,  0, -1,  0,  0 ],
      [ 0,  0,  0,  0,  0,  0,  0,  0 ],
      [ 0, -1,  0, -1,  0,  0,  0,  0 ],
      [ 0,  0,  1,  0,  0,  0,  0,  0 ],
    ].reverse();

    it('should find the best play from this position', () => {
      const [move, score] = analyze(newBoardFromData(initialData), 1);
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
