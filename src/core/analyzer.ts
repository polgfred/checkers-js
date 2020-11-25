import { BoardType, MoveType, makeRules } from './rules';
import { Evaluator } from './evaluator';
import defaultEvaluator from './default_evaluator';

export function analyze(board: BoardType, side: number): [MoveType, number] {
  // how many levels deep to search the tree
  const level = 8;

  // make the rules for the current position
  const { getBoard, getSide, findJumps, doJump, findMoves, doMove } = makeRules(
    board,
    side
  );

  function loop(level: number, player: Evaluator): [MoveType, number] {
    const board = getBoard();
    const side = getSide();
    let bestScore = side / -0;
    let bestPlay: MoveType;
    let current: number;

    // always try to find counter-jumps from this position
    const jumps = findJumps();

    if (jumps.length) {
      for (let i = 0; i < jumps.length; ++i) {
        const jump = jumps[i];

        // perform the jump and descend a level
        const reverse = doJump(jump);
        current = loop(level - 1, player)[1];
        reverse();

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
        const moves = findMoves();

        for (let i = 0; i < moves.length; ++i) {
          const move = moves[i];

          // perform the jump and descend a level
          const reverse = doMove(move);
          current = loop(level - 1, player)[1];
          reverse();

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
