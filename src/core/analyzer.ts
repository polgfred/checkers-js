import defaultEvaluator from './default-evaluator';
import { makeRules, MoveGenerator } from './rules';
import { type BoardType, type PlayType, SideType } from './types';

const { RED, WHT } = SideType;

// how many levels deep to search the tree
const LEVEL = 12;

type MaybePlay = PlayType | undefined;

export function analyze(
  board: BoardType,
  side: SideType,
  player = defaultEvaluator
): readonly [number, MaybePlay] {
  const { getSide, findJumps, findMoves } = makeRules(board, side);

  let level = LEVEL;

  function loop(alpha = -Infinity, beta = +Infinity) {
    const side = getSide();
    let value = side === RED ? -Infinity : +Infinity;
    let play: MaybePlay;

    function next(source: MoveGenerator) {
      let found = false;

      level--;

      for (const jump of source) {
        found = true;

        const [current] = loop(alpha, beta);

        switch (side) {
          case RED:
            if (current > value) {
              value = current;
              play = jump;
            }
            if (value >= beta) {
              source.return();
              break;
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
              source.return();
              break;
            }
            if (value < beta) {
              beta = value;
            }
            break;
        }
      }

      level++;

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
