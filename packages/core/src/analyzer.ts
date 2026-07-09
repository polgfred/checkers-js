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

function any(source: MoveGenerator) {
  // get the first move (if any) and abort
  const { done } = source.next();
  source.return();
  return !done;
}

const defaultEvaluator = makeDefaultEvaluator();

export function analyze(
  board: BoardType,
  side: SideType,
  maxDepth = LEVEL,
  evaluate = defaultEvaluator.evaluate
): readonly [number, PlayType | null] {
  const { findJumps, findMoves, iteratePlays } = makeRules(board);

  // top-level ID: could theoretically generalize this
  let plays = findJumps(side).toArray();
  if (!plays.length) plays = findMoves(side).toArray();
  if (!plays.length) return [-MATE, null];

  // aspiration half-width around the previous iteration's score
  const delta = 100;

  let score: number | null = null;
  let play: PlayType | null = null;
  let rootLevel = 0;
  for (rootLevel = 1; rootLevel <= maxDepth; rootLevel++) {
    // window centered on the last score; full width on the first pass
    let alpha = score === null ? -MATE : Math.max(score - delta, -MATE);
    let beta = score === null ? +MATE : Math.min(score + delta, +MATE);

    // a narrow window can fail, returning only a bound; re-search the failed
    // side out to the mate bound until the value lands inside the window
    let s: number | null;
    while (true) {
      s = best(side, rootLevel, alpha, beta, iteratePlays(plays));
      if (s === null) break;
      if (s <= alpha) alpha = -MATE;
      else if (s >= beta) beta = +MATE;
      else break;
    }
    score = s;

    // the window held, so `play` is the real best move — float it to the front
    if (play) {
      const found = plays.indexOf(play);
      if (found !== -1) {
        plays.splice(found, 1);
        plays.unshift(play);
      }
    }
  }

  return [score ?? -MATE, play];

  function lazy(side: SideType, level: number, alpha: number, beta: number) {
    // always search for jumps
    let val = best(side, level, alpha, beta, findJumps(side));
    if (val === null) {
      const moves = findMoves(side);
      // search for moves until max depth, otherwise run the evaluator
      if (level > 0) val = best(side, level, alpha, beta, moves);
      else if (any(moves)) val = side * evaluate(board);
    }

    // encode the ply with a win (shorter is better)
    return val ?? -MATE + rootLevel - level;
  }

  function best(
    side: SideType,
    level: number,
    alpha: number,
    beta: number,
    source: MoveGenerator
  ): number | null {
    // @ts-expect-error side flip
    const opp: SideType = -side;
    let value: number | null = null;
    for (const coll of source) {
      // negamax
      const current = -lazy(opp, level - 1, -beta, -alpha);
      if (value === null || current > value) {
        value = current;
        if (level === rootLevel) play = coll;
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
}
