import { BoardType, MoveType, SideType } from './types';
import { makeRules } from './rules';
import { Evaluator } from './evaluator';
import defaultEvaluator from './default_evaluator';

const { RED, WHT } = SideType;

// how many levels deep to search the tree
const LEVEL = 8;

export function analyze(
  board: BoardType,
  side: SideType,
  player: Evaluator = defaultEvaluator
): readonly [MoveType, number] {
  // make the rules for the current position
  const { getBoard, getSide, findJumps, doJump, findMoves, doMove } = makeRules(
    board,
    side
  );

  function loop(level: number): [MoveType, number] {
    const board = getBoard();
    const side = getSide();
    let bestScore = side / -0;
    let bestPlay: MoveType;
    let current: number;

    // if there are jumps from this position, keep searching
    const jumps = findJumps();
    if (jumps.length) {
      // analyze counter-jumps from this position
      for (let i = 0; i < jumps.length; ++i) {
        const jump = jumps[i];

        // perform the jump and descend a level
        const reverse = doJump(jump);
        current = loop(level - 1)[1];
        reverse();

        // keep track of the best move from this position
        if (
          (side === RED && current > bestScore) ||
          (side === WHT && current < bestScore)
        ) {
          bestPlay = jump;
          bestScore = current;
        }
      }
    } else if (level > 0) {
      // analyze counter-moves from this position
      const moves = findMoves();

      for (let i = 0; i < moves.length; ++i) {
        const move = moves[i];

        // perform the jump and descend a level
        const reverse = doMove(move);
        current = loop(level - 1)[1];
        reverse();

        // keep track of the best move from this position
        if (
          (side === RED && current > bestScore) ||
          (side === WHT && current < bestScore)
        ) {
          bestPlay = move;
          bestScore = current;
        }
      }
    } else {
      // we've hit bottom and there are no jumps, so just return
      // the score for this position
      bestScore = player.evaluate(board);
    }

    // a pair representing the winning play and score for this turn
    return [bestPlay, bestScore];
  }

  // start the descent
  return loop(LEVEL);
}
