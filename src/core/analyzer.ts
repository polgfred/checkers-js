import { type BoardType, type MoveType, SideType } from './types';
import { makeRules, MoveGenerator } from './rules';
import { Evaluator } from './evaluator';
import defaultEvaluator from './default-evaluator';

const { RED, WHT } = SideType;

// how many levels deep to search the tree
const LEVEL = 8;

export function analyze(
  board: BoardType,
  side: SideType,
  player: Evaluator = defaultEvaluator
): readonly [number, MoveType] {
  const { getSide, findJumps, findMoves } = makeRules(board, side);

  let level = LEVEL;

  function loop(alpha = -Infinity, beta = +Infinity) {
    const side = getSide();
    let value = side === RED ? -Infinity : Infinity;
    let play: MoveType;

    function next(source: MoveGenerator) {
      let found = false;
      let prune = false;

      for (const jump of source) {
        if (prune) {
          continue;
        }

        found = true;
        level--;
        const [current] = loop(alpha, beta);
        level++;

        switch (side) {
          case RED:
            if (current > value) {
              value = current;
              play = jump;
            }
            if (value >= beta) {
              prune = true;
            }
            if (value > alpha) {
              alpha = value;
            }
            break;
          case WHT:
            if (current < value) {
              value = current;
              play = jump;
            }
            if (value <= alpha) {
              prune = true;
            }
            if (value < beta) {
              beta = value;
            }
            break;
        }
      }

      return found;
    }

    const found = next(findJumps());
    if (!found) {
      if (level <= 0) {
        value = player.evaluate(board);
      } else {
        next(findMoves());
      }
    }

    return [value, play] as const;
  }

  // start the descent
  return loop(-Infinity, +Infinity);
}
