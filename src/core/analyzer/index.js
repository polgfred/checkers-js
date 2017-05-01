'use strict';

import Rules from '../rules';

import Evaluator from './evaluator';
import defaultEvaluator from './default_evaluator';

export default class Analyzer extends Rules {
  constructor(board, side) {
    super(board, side);

    // a flat version of the board backed by the same data
    this.flat = new Int8Array(board[0].buffer, 0, 64);

    // use default evaluator for both sides (but feel free to change it)
    this.redEval = this.whiteEval = defaultEvaluator;

    // how many levels deep to search the tree
    this.level = 6;
  }

  evaluate() {
    // delegate to the current player's evaluator
    let playerEval = this.side == 1 ? this.redEval : this.whiteEval;

    return playerEval.evaluate(this.flat);
  }

  run() {
    // keep track of the current player's evaluator when switching sides
    let playerEval = this.side == 1 ? this.redEval : this.whiteEval;

    // loop entry point as we recurse into the void
    let loop = (level) => {
      let bestScore, bestPlay, score,
          current = playerEval.evaluate(this.flat);

      // handle tree descent for both jumps and moves
      let descend = (play) => {
        let next = playerEval.evaluate(this.flat),
            adjust = Math.min(Math.floor((current - next) / 50) - 1, 1);

        // switch sides and descend a level
        this.side = -this.side;
        score = loop(level + adjust)[1];
        this.side = -this.side;

        // keep track of the best move from this position
        if (bestScore === undefined ||
            (this.side == +1 && score > bestScore) ||
            (this.side == -1 && score < bestScore)) {
          bestPlay = play;
          bestScore = score;
        }
      };

      // always try to find counter-jumps from this position
      if (!this.myJumps(descend)) {
        // see if we've hit bottom
        if (level < 0) {
          // return score for this position
          bestScore = current;
        } else {
          // find counter-moves from this position
          this.myMoves(descend);
        }
      }

      // if there are no moves from this position, the player loses
      if (bestScore === undefined) {
        bestScore = -this.side * Infinity;
      }

      // a pair representing the winning play and score for this turn
      return [bestPlay, bestScore];
    }

    // start at the top level
    return loop(this.level);
  }
}

// export the evaluator submodule
export { Evaluator };
