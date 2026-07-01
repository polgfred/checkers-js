import { makeDefaultEvaluator } from './default-evaluator';
import { makeRules, type MoveGenerator } from './rules';
import { type BoardType, type PlayType, SideType } from './types';

const { RED, WHT } = SideType;

// how many levels deep to search the tree
const LEVEL = 12;

// terminal (win/loss) scores live in a finite band near ±MATE so that ply
// distance can be folded in: shorter wins score better.
const MATE = 1 << 20;

// decode a raw score into the mate it encodes, or null if it's a heuristic eval.
// `winner` is the side delivering the mate; `plies` is how far off it is.
export function mateInfo(
  score: number
): { winner: SideType; plies: number } | null {
  if (Math.abs(score) <= MATE >> 1) return null;
  return {
    winner: score > 0 ? RED : WHT,
    plies: MATE - Math.abs(score),
  };
}

type MaybePlay = PlayType | undefined;

export function analyze(
  board: BoardType,
  side: SideType,
  maxDepth = LEVEL,
  player = makeDefaultEvaluator()
): readonly [number, MaybePlay] {
  const { getSide, findJumps, findMoves } = makeRules(board, side);

  let level = maxDepth;

  function loop(alpha = -Infinity, beta = +Infinity) {
    const side = getSide();
    let value = side === RED ? -Infinity : +Infinity;
    let play: MaybePlay;

    function hasAny(source: MoveGenerator) {
      const first = source.next();
      source.return();
      return !first.done;
    }

    function next(source: MoveGenerator) {
      let found = false;

      level--;

      for (const jump of source) {
        found = true;

        const [current] = loop(alpha, beta);

        switch (side) {
          case RED:
            if (current > value || play === undefined) {
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
            if (current < value || play === undefined) {
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
      // encode the ply distance so shorter wins / longer losses score better
      const plies = maxDepth - level;
      const mated = side === RED ? -MATE + plies : +MATE - plies;
      if (level <= 0) {
        value = hasAny(findMoves()) ? player.evaluate(board) : mated;
      } else if (!next(findMoves())) {
        value = mated;
      }
    }

    return [value, play] as const;
  }

  // start the descent
  return loop();
}
