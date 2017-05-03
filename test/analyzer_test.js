import expect from 'expect.js';

import { inspect } from 'util';

import Analyzer, { Evaluator } from '../src/core/analyzer';
import { newBoard, newBoardFromData } from '../src/core/utils';

describe('Analyzer', function() {
  describe('with the default position', function() {
    before(function() {
      let board = newBoard();

      this.analyzer = new Analyzer(board, +1);
    });

    it('should initialize the player', function() {
      expect(this.analyzer.board[0][0]).to.be(+1);
    });

    it('should initialize the side', function() {
      expect(this.analyzer.side).to.be(+1);
    });

    it('should initialize the level', function() {
      expect(this.analyzer.level).to.be(8);
    });

    it('should score the initial position', function() {
      // both sides have the same score
      expect(this.analyzer.evaluate()).to.be(0);
    });
  });

  describe('with a contrived multi-jump position', function() {
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

      this.analyzer = new Analyzer(board, +1);
    });

    it('should initialize the player', function() {
      expect(this.analyzer.board[0][0]).to.be(0);
    });

    it('should initialize the side', function() {
      expect(this.analyzer.side).to.be(+1);
    });

    it('should initialize the level', function() {
      expect(this.analyzer.level).to.be(8);
    });

    it('should score the position', function() {
      expect(this.analyzer.evaluate()).to.be.below(0);
    });

    describe('running the analyzer', function() {
      before(function() {
        this.play = this.analyzer.run();
      });

      it('should find the best play from this position', function() {
        expect(this.play[0]).to.eql([ 2, 0, 4, 2, 6, 4, 4, 6 ]);
      });

      it('should find the best score from this position', function() {
        expect(this.play[1]).to.be.below(0);
      });
    });
  });
});
