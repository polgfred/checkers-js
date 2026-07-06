import { makeDefaultEvaluator } from './default-evaluator';
import {
  convertPlay,
  makeRules,
  type Collector,
  type MoveGenerator,
} from './rules';
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

export function analyze(
  board: BoardType,
  side: SideType,
  maxDepth = LEVEL,
  player = makeDefaultEvaluator()
): readonly [number, PlayType | null] {
  const { findJumps, findMoves } = makeRules(board);
  let play: Collector | null = null;

  const score = loop(0, side);
  return [score, play ? convertPlay(play) : null];

  function loop(level: number, side: SideType, alpha = -MATE, beta = +MATE) {
    // @ts-expect-error side flip
    const opp: SideType = -side;
    let value = -MATE - 1;

    function hasAny(source: MoveGenerator) {
      const { done } = source.next();
      source.return();
      return !done;
    }

    function next(source: MoveGenerator) {
      let found = false;

      for (const coll of source) {
        found = true;

        const current = -loop(level + 1, opp, -beta, -alpha);
        if (current > value) {
          value = current;
          // we're at the root: save the play so we can return it
          if (level === 0) play = [...coll];
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
      const mated = -MATE + level;
      if (level >= maxDepth) {
        value = hasAny(findMoves(side)) ? side * player.evaluate(board) : mated;
      } else if (!next(findMoves(side))) {
        value = mated;
      }
    }

    return value;
  }
}
