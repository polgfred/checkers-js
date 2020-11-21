import Analyzer from '../src/core/analyzer';
import { newBoard, newBoardFromData } from '../src/core/utils';

describe('Analyzer', () => {
  describe('with the default position', () => {
    let analyzer;

    beforeEach(() => {
      analyzer = new Analyzer(newBoard(), 1);
    });

    it('should initialize the player', () => {
      expect(analyzer.board[0][0]).toBe(1);
    });

    it('should initialize the side', () => {
      expect(analyzer.side).toBe(1);
    });

    it('should initialize the level', () => {
      expect(analyzer.level).toBe(8);
    });

    it('should score the initial position', () => {
      // both sides have the same score
      expect(analyzer.evaluate()).toBe(0);
    });
  });

  describe('with a contrived multi-jump position', () => {
    let analyzer;

    beforeEach(() => {
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
        1
      );
    });

    it('should initialize the player', () => {
      expect(analyzer.board[0][0]).toBe(0);
    });

    it('should initialize the side', () => {
      expect(analyzer.side).toBe(1);
    });

    it('should initialize the level', () => {
      expect(analyzer.level).toBe(8);
    });

    it('should score the position', () => {
      expect(analyzer.evaluate()).toBeLessThan(0);
    });

    describe('running the analyzer', () => {
      let play;

      beforeEach(() => {
        play = analyzer.run();
      });

      it('should find the best play from this position', () => {
        expect(play[0]).toEqual([
          [2, 0],
          [4, 2, 3, 1],
          [6, 4, 5, 3],
          [4, 6, 5, 5],
        ]);
      });

      it('should find the best score from this position', () => {
        expect(play[1]).toBeLessThan(0);
      });
    });
  });
});
