import { describe, expect, it } from 'vitest';

import { makeEvaluator } from './evaluator';
import { newBoard } from './utils';

describe('Evaluator', () => {
  it('should treat out-of-bounds formation entries as non-matches', () => {
    const evaluator = makeEvaluator();

    evaluator.addFormation(
      [
        { dx: 0, dy: 0, value: 1 },
        { dx: 0, dy: -1, value: 1 },
      ],
      // prettier-ignore
      [
        [  0,  0,  0,  0,  0,  0,  0, 99 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [  0,  0,  0,  0,  0,  0,  0,  0 ],
        [ 99,  0,  0,  0,  0,  0,  0,  0 ],
      ]
    );

    expect(evaluator.evaluate(newBoard())).toBe(0);
  });
});
