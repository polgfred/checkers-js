import { makeDefaultEvaluator } from './default-evaluator';
import { makeRules, type MoveGenerator } from './rules';
import type { BoardType, PlayType, SideType } from './types';

// how many levels deep to search the tree
const LEVEL = 12;

// terminal (win/loss) scores live in a finite band near ±MATE so that ply
// distance can be folded in: shorter wins score better.
const MATE = 1 << 20;

// decode a raw score into the mate it encodes, or null if it's a heuristic eval.
// scores are negamax (relative to the side to move), so the mate is simply a win
// or loss for that side; `plies` is how far off it is.
export function mateInfo(
  score: number
): { result: 'win' | 'loss'; plies: number } | null {
  if (Math.abs(score) <= MATE >> 1) return null;
  return {
    result: score > 0 ? 'win' : 'loss',
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
      // no plays => the side to move is mated. in negamax that's always a loss
      // for the mover; encode ply distance so shorter losses score better.
      const plies = maxDepth - level;
      const mated = -MATE + plies;
      if (level <= 0) {
        value = hasAny(findMoves(side)) ? side * player.evaluate(board) : mated;
      } else if (!next(findMoves(side))) {
        value = mated;
      }
    }

    return [value, play] as const;
  }
}
