import Rules from './rules';
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
    const playerEval = this.side === 1 ? this.redEval : this.whiteEval;

    return playerEval.evaluate(this.board);
  }

  run() {
    // keep track of the current player's evaluator when switching sides
    const player = this.side === 1 ? this.redEval : this.whiteEval;

    // start at the top level
    return this.loop(this.level, player);
  }

  loop(level, player) {
    const { board, side } = this;
    let bestScore = -side * Infinity;
    let bestPlay;
    let current;

    // always try to find counter-jumps from this position
    const jumps = this.findJumps();

    if (jumps.length) {
      for (let i = 0; i < jumps.length; ++i) {
        const jump = jumps[i];

        this.withJump(jump, () => {
          // switch sides and descend a level
          this.side = -side;
          current = this.loop(level - 1, player)[1];
          this.side = side;
        });

        // keep track of the best move from this position
        if (
          (side === +1 && current > bestScore) ||
          (side === -1 && current < bestScore)
        ) {
          bestPlay = jump;
          bestScore = current;
        }
      }
    } else {
      current = player.evaluate(board);

      // see if we've hit bottom
      if (level <= 0) {
        // return score for this position
        bestScore = current;
      } else {
        // find counter-moves from this position
        const moves = this.findMoves();

        for (let i = 0; i < moves.length; ++i) {
          const move = moves[i];

          this.withMove(move, () => {
            // switch sides and descend a level
            this.side = -side;
            current = this.loop(level - 1, player)[1];
            this.side = side;
          });

          // keep track of the best move from this position
          if (
            (side === +1 && current > bestScore) ||
            (side === -1 && current < bestScore)
          ) {
            bestPlay = move;
            bestScore = current;
          }
        }
      }
    }

    // a pair representing the winning play and score for this turn
    return [bestPlay, bestScore];
  }
}
