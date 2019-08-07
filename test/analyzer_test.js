import expect from 'expect.js';

import Analyzer from '../src/core/analyzer';
import { newBoard, newBoardFromData } from '../src/core/utils';

describe('Analyzer', () => {
  describe('with the default position', () => {
    let analyzer;

    before(() => {
      analyzer = new Analyzer(newBoard(), +1);
    });

    it('should initialize the player', () => {
      expect(analyzer.board[0][0]).to.be(+1);
    });

    it('should initialize the side', () => {
      expect(analyzer.side).to.be(+1);
    });

    it('should initialize the level', () => {
      expect(analyzer.level).to.be(8);
    });

    it('should score the initial position', () => {
      // both sides have the same score
      expect(analyzer.evaluate()).to.be(0);
    });
  });

  describe('with a contrived multi-jump position', () => {
    let analyzer;

    before(() => {
      analyzer = new Analyzer(
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
        +1
      );
    });

    it('should initialize the player', () => {
      expect(analyzer.board[0][0]).to.be(0);
    });

    it('should initialize the side', () => {
      expect(analyzer.side).to.be(+1);
    });

    it('should initialize the level', () => {
      expect(analyzer.level).to.be(8);
    });

    it('should score the position', () => {
      expect(analyzer.evaluate()).to.be.below(0);
    });

    describe('running the analyzer', () => {
      let play;

      before(() => {
        play = analyzer.run();
      });

      it('should find the best play from this position', () => {
        expect(play[0]).to.eql([
          [2, 0],
          [4, 2, 3, 1],
          [6, 4, 5, 3],
          [4, 6, 5, 5],
        ]);
      });

      it('should find the best score from this position', () => {
        expect(play[1]).to.be.below(0);
      });
    });
  });
});
