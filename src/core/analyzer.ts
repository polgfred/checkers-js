import { Board, Move, makeRules } from './rules';
import defaultEvaluator from './default_evaluator';
import { Evaluator } from './evaluator';

export function analyze(board: Board, side: number): [Move, number] {
  // how many levels deep to search the tree
  const level = 8;

  // make the rules for the current position
  const rules = makeRules(board, side);

  function loop(level: number, player: Evaluator): [Move, number] {
    const board = rules.board();
    let side = rules.side();
    let bestScore = side / -0;
    let bestPlay: Move;
    let current: number;

    // always try to find counter-jumps from this position
    const jumps = rules.findJumps();

    if (jumps.length) {
      for (let i = 0; i < jumps.length; ++i) {
        const jump = jumps[i];

        rules.withJump(jump, () => {
          // descend a level
          current = loop(level - 1, player)[1];
        });

        // keep track of the best move from this position
        if (
          (side === 1 && current > bestScore) ||
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
        const moves = rules.findMoves();

        for (let i = 0; i < moves.length; ++i) {
          const move = moves[i];

          rules.withMove(move, () => {
            // descend a level
            current = loop(level - 1, player)[1];
          });

          // keep track of the best move from this position
          if (
            (side === 1 && current > bestScore) ||
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

  // start at the top level
  // use default evaluator for both sides (but feel free to change it)
  return loop(level, defaultEvaluator);
}
