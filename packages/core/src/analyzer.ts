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

function any(source: MoveGenerator) {
  // get the first move (if any) and abort
  const { done } = source.next();
  source.return();
  return !done;
}

export function analyze(
  board: BoardType,
  side: SideType,
  maxDepth = LEVEL,
  player = makeDefaultEvaluator()
): readonly [number, PlayType | null] {
  const { findJumps, findMoves, iteratePlays } = makeRules(board);
  let play: Collector | null = null;
  let result = collect(findJumps(side)) ?? collect(findMoves(side));
  if (result === null) return [-MATE, null];

  const [estimate, plays] = result;
  const delta = 100;
  let score = best(
    side,
    maxDepth,
    estimate - delta,
    estimate + delta,
    iteratePlays(plays)
  );
  if (
    score !== null &&
    (score <= estimate - delta || score >= estimate + delta)
  ) {
    score = best(side, maxDepth, -MATE, +MATE, iteratePlays(plays));
  }
  return [score ?? -MATE, play ? convertPlay(play) : null];

  function collect(source: MoveGenerator) {
    // @ts-expect-error side flip
    const opp: SideType = -side;

    // collect and sort the top level moves
    const top: [number, Collector][] = [];
    for (const coll of source) {
      const current = -lazy(opp, 3, -MATE, +MATE);
      top.push([current, [...coll]]);
    }

    if (top.length === 0) return null;
    const sorted = top.sort((a, b) => b[0] - a[0]);
    return [sorted[0][0], sorted.map((play) => play[1])] as const;
  }

  function lazy(side: SideType, level: number, alpha: number, beta: number) {
    // always search for jumps
    let val = best(side, level, alpha, beta, findJumps(side));
    if (val === null) {
      const moves = findMoves(side);
      // search for moves until max depth, otherwise run the evaluator
      if (level > 0) val = best(side, level, alpha, beta, moves);
      else if (any(moves)) val = side * player.evaluate(board);
    }

    // encode the ply with a win (shorter is better)
    return val ?? -MATE + maxDepth - level;
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
        if (level === maxDepth) play = [...coll];
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
