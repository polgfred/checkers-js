'use strict';

import Rules from '../rules';

import defaultEvaluator from './default_evaluator';

export default class Analyzer extends Rules {
  constructor(board, side) {
    super(board, side);

    // use default evaluator for both sides (but feel free to change it)
    this.redEval = this.whiteEval = defaultEvaluator;

    // how many levels deep to search the tree
    this.level = 8;
  }

  evaluate() {
    // delegate to the current player's evaluator
    let playerEval = this.side == 1 ? this.redEval : this.whiteEval;

    return playerEval.evaluate(this.board);
  }

  run() {
    // keep track of the current player's evaluator when switching sides
    let { board } = this,
        playerEval = this.side == 1 ? this.redEval : this.whiteEval,
        initial = playerEval.evaluate(board);

    // loop entry point as we recurse into the void
    let loop = (level) => {
      let { side } = this,
          bestScore, bestPlay, current;

      // always try to find counter-jumps from this position
      let jumps = this.findJumps();

      if (jumps.length) {
        for (let i = 0; i < jumps.length; ++i) {
          let jump = jumps[i],
              undo = this.doJump(jump);

          // switch sides and descend a level
          this.side = -side;
          current = loop(level - 1)[1];
          this.side = side;
          this.undoJump(jump, undo);

          // keep track of the best move from this position
          if (bestScore === undefined ||
              (side == +1 && current > bestScore) ||
              (side == -1 && current < bestScore)) {
            bestPlay = jump;
            bestScore = current;
          }
        }
      } else {
        current = playerEval.evaluate(board);

        let gain = current - initial;

        // see if we've hit bottom

        // TODO/FIXME:
        // this pruning is far from ideal - we look to see if there are
        // large gains or losses relative to the initial position, but it
        // should really be done relative to the current plays, as a bell
        // curve or something
        if (level <= 0 ||
            (level <= 2 && (gain <= -25 || gain >= +25)) ||
            (level <= 4 && (gain <= -75 || gain >= +75))) {
          // return score for this position
          bestScore = current;
        } else {
          // find counter-moves from this position
          let moves = this.findMoves();

          for (let i = 0; i < moves.length; ++i) {
            let move = moves[i],
                undo = this.doMove(move);

            // switch sides and descend a level
            this.side = -side;
            current = loop(level - 1)[1];
            this.side = side;
            this.undoMove(move, undo);

            // keep track of the best move from this position
            if (bestScore === undefined ||
                (side == +1 && current > bestScore) ||
                (side == -1 && current < bestScore)) {
              bestPlay = move;
              bestScore = current;
            }
          }
        }
      }

      // if there are no moves from this position, the player loses
      if (bestScore === undefined) {
        bestScore = -side * Infinity;
      }

      // a pair representing the winning play and score for this turn
      return [bestPlay, bestScore];
    }

    // start at the top level
    return loop(this.level);
  }
}

// export the evaluator submodule
export { Evaluator } from './evaluator';
