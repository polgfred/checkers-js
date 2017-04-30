import expect from 'expect.js';

import { inspect } from 'util';

import Analyzer, { Evaluator } from '../src/core/analyzer';
import { newBoardFromData } from '../src/core/utils';

// use the original piece tables so the tests run
const defaultEvaluator = new Evaluator();

defaultEvaluator.addFormation([
  [ 0, 0, 1 ]
], [
  [  0,  0,  0,  0,  0,  0,  0,  0 ],
  [ 75,  0, 78,  0, 78,  0, 75,  0 ],
  [  0, 67,  0, 72,  0, 72,  0, 67 ],
  [ 61,  0, 67,  0, 67,  0, 61,  0 ],
  [  0, 58,  0, 61,  0, 61,  0, 58 ],
  [ 56,  0, 58,  0, 58,  0, 56,  0 ],
  [  0, 55,  0, 56,  0, 56,  0, 55 ],
  [ 55,  0, 58,  0, 58,  0, 55,  0 ]
].reverse());

defaultEvaluator.addFormation([
  [ 0, 0, 2 ]
], [
  [  0, 92,  0, 85,  0, 85,  0, 85 ],
  [ 92,  0, 92,  0, 92,  0, 92,  0 ],
  [  0, 92,  0, 99,  0, 99,  0, 85 ],
  [ 85,  0, 99,  0, 99,  0, 92,  0 ],
  [  0, 92,  0, 99,  0, 99,  0, 85 ],
  [ 85,  0, 99,  0, 99,  0, 92,  0 ],
  [  0, 92,  0, 92,  0, 92,  0, 92 ],
  [ 85,  0, 85,  0, 85,  0, 92,  0 ]
].reverse());

describe('Analyzer', function() {
  before(function() {
    let board = newBoardFromData([
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0, -1,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0, -1,  0, -1,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0, -1,  0, -1,  0,  0,  0,  0 ],
      [  0,  0,  1,  0,  0,  0,  0,  0 ]
    ].reverse());

    this.analyzer = new Analyzer(board, 1);
    this.analyzer.redEval = defaultEvaluator;
  });

  it('should initialize the player', function() {
    expect(this.analyzer.board[0][0]).to.be(0);
  });

  it('should initialize the side', function() {
    expect(this.analyzer.side).to.be(1);
  });

  it('should initialize the level', function() {
    expect(this.analyzer.level).to.be(6);
  });

  describe('#run', function() {
    it('should find the best play from this position', function() {
      this.play = this.analyzer.run();
      expect(this.play[0]).to.eql([ 2, 0, 4, 2, 6, 4, 4, 6 ]);
    });

    it('should find the best score from this position', function() {
      this.play = this.analyzer.run();
      expect(this.play[1]).to.be(-68);
    });

    describe('with different piece tables', function() {
      before(function() {
        this.analyzer.redEval = new Evaluator();
        this.analyzer.redEval.addFormation([
          [ 0, 0, 1 ]
        ], [
          [  0,  0,  0,  0,  0,  0,  0, 0  ],
          [ 80,  0, 78,  0, 78,  0, 80,  0 ],
          [  0, 72,  0, 72,  0, 77,  0, 67 ],
          [ 61,  0, 72,  0, 82,  0, 61,  0 ],
          [  0, 58,  0, 66,  0, 61,  0, 58 ],
          [ 56,  0, 63,  0, 63,  0, 56,  0 ],
          [  0, 60,  0, 56,  0, 61,  0, 55 ],
          [ 60,  0, 58,  0, 58,  0, 60,  0 ]
        ].reverse());
      });

      it('should find the best score from this position', function() {
        this.play = this.analyzer.run();
        expect(this.play[1]).to.be(-82);
      });
    });
  });
});
