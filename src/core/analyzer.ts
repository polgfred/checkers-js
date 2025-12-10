import { type BoardType, type MoveType, SideType } from './types';
import { makeRules } from './rules';
import { Evaluator } from './evaluator';
import defaultEvaluator from './default-evaluator';

const { RED } = SideType;

// how many levels deep to search the tree
const LEVEL = 8;

export function analyze(
  board: BoardType,
  side: SideType,
  player: Evaluator = defaultEvaluator
): readonly [MoveType, number] {
  // make the rules for the current position
  const { getBoard, getSide, findJumps, findMoves } = makeRules(board, side);

  function loop(level: number) {
    const board = getBoard();
    const side = getSide();

    let bestScore = side / -0;
    let bestPlay: MoveType;
    let current: number;
    let found = false;

    // analyze counter-jumps from this position
    for (const jump of findJumps()) {
      found = true;
      [, current] = loop(level - 1);

      // keep track of the best move from this position
      if (side === RED ? current > bestScore : current < bestScore) {
        bestPlay = jump;
        bestScore = current;
      }
    }

    // no jumps found, so analyze regular moves
    if (!found) {
      if (level > 0) {
        // analyze counter-moves from this position
        for (const move of findMoves()) {
          [, current] = loop(level - 1);

          // keep track of the best move from this position
          if (side === RED ? current > bestScore : current < bestScore) {
            bestPlay = move;
            bestScore = current;
          }
        }
      } else {
        // we've hit bottom and there are no jumps, so just return
        // the score for this position
        bestScore = player.evaluate(board);
      }
    }

    // a pair representing the winning play and score for this turn
    return [bestPlay, bestScore] as const;
  }

  // start the descent
  return loop(LEVEL);
}
