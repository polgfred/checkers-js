'use strict';

import Rules from '../rules';

import Evaluator from './evaluator';

// default evaluators
const defaultEval = new Evaluator();

// formation corresponding to the old piece table
defaultEval.addFormation([
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

// formation corresponding to the old king table
defaultEval.addFormation([
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

export default class Analyzer extends Rules {
  constructor(board, side) {
    super(board, side);

    // a flat version of the board backed by the same data
    this.flat = new Int8Array(board[0].buffer, 0, 64);

    // use default evaluator for both sides (but feel free to change it)
    this.redEval = this.whiteEval = defaultEval;

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
    let playerEval = this.side == 1 ? this.redEval : this.whiteEval,
        level = this.level;

    // loop entry point as we recurse into the void
    let loop = () => {
      let bestScore, bestPlay, score;

      // loop over plays from this position
      this.myPlays(play => {
        this.side = -this.side;

        // see if we need to recurse further
        if (level < 1 && !this.myJumps(() => {})) {
          // we hit the search depth and there are no counter-jumps
          this.side = -this.side;
          score = playerEval.evaluate(this.flat);
        } else {
          // need to go further down the hole
          level--;
          score = loop()[1];
          level++;
          this.side = -this.side;
        }

        // keep track of the best move from this position
        if (bestScore === undefined ||
            (this.side == +1 && score > bestScore) ||
            (this.side == -1 && score < bestScore)) {
          bestScore = score;
          bestPlay  = play;
        }
      });

      // if there are no moves from this position, the player loses
      if (bestScore === undefined) {
        bestScore = this.side == 1 ? -Infinity : +Infinity;
      }

      // a pair representing the winning play and score for this turn
      return [bestPlay, bestScore];
    }

    return loop();
  }
}

// export the evaluator submodule
export { Evaluator };
