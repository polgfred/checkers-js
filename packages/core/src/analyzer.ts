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
  const { findJumps, findMoves } = makeRules(board);

  return loop(maxDepth, side);

  function loop(
    level: number,
    side: SideType,
    alpha = -Infinity,
    beta = +Infinity
  ) {
    // @ts-expect-error side flip
    const opp: SideType = -side;
    let value = -Infinity;
    let play: MaybePlay;

    function hasAny(source: MoveGenerator) {
      const { done } = source.next();
      source.return();
      return !done;
    }

    function next(source: MoveGenerator) {
      let found = false;

      for (const jump of source) {
        found = true;

        const current = -loop(level - 1, opp, -beta, -alpha)[0];

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
      }

      return found;
    }

    const found = next(findJumps(side));
    if (!found) {
      // encode the ply distance so shorter wins / longer losses score better
      const plies = maxDepth - level;
      const mated = side * (-MATE + plies);
      if (level <= 0) {
        value = hasAny(findMoves(side)) ? side * player.evaluate(board) : mated;
      } else if (!next(findMoves(side))) {
        value = mated;
      }
    }

    return [value, play] as const;
  }
}
