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

  const score = loop(side, 0, -MATE, +MATE);
  return [score, play ? convertPlay(play) : null];

  function any(source: MoveGenerator) {
    // get the first move (if any) and abort
    const { done } = source.next();
    source.return();
    return !done;
  }

  function loop(side: SideType, level: number, alpha: number, beta: number) {
    // @ts-expect-error side flip
    const opp: SideType = -side;

    function next(source: MoveGenerator): number | null {
      let value: number | null = null;
      for (const coll of source) {
        // negamax
        const current = -loop(opp, level + 1, -beta, -alpha);
        if (value === null || current > value) {
          value = current;
          // we're at the root: save the play so we can return it
          if (level === 0) play = [...coll];
        }
        // pruning
        if (value >= beta) {
          // abort the generator and break out
          source.return();
          break;
        }
        if (value > alpha) alpha = value;
      }
      return value;
    }

    // always search for jumps
    let val = next(findJumps(side));
    if (val === null) {
      const moves = findMoves(side);
      // search for moves until max depth, otherwise run the evaluator
      if (level < maxDepth) val = next(moves);
      else if (any(moves)) val = side * player.evaluate(board);
    }

    // encode the ply with a win (shorter is better)
    return val ?? -MATE + level;
  }
}
