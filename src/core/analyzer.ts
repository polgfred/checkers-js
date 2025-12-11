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
): readonly [number, MoveType] {
  const { findJumps, findMoves } = makeRules(board, side);

  function loopmax(
    level: number,
    alpha: number,
    beta: number
  ): readonly [number, MoveType] {
    let value = -Infinity;
    let play: MoveType;
    let found = false;

    let prune = false;
    for (const jump of findJumps()) {
      if (prune) {
        continue;
      }
      found = true;
      const [current] = loopmin(level - 1, alpha, beta);
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
    }

    if (!found) {
      if (level <= 0) {
        value = player.evaluate(board);
      } else {
        prune = false;
        for (const move of findMoves()) {
          if (prune) {
            continue;
          }
          const [current] = loopmin(level - 1, alpha, beta);
          if (current > value) {
            value = current;
            play = move;
          }
          if (value >= beta) {
            prune = true;
          }
          if (value > alpha) {
            alpha = value;
          }
        }
      }
    }

    return [value, play] as const;
  }

  function loopmin(
    level: number,
    alpha: number,
    beta: number
  ): readonly [number, MoveType] {
    let value = +Infinity;
    let play: MoveType;
    let found = false;

    let prune = false;
    for (const jump of findJumps()) {
      if (prune) {
        continue;
      }
      found = true;
      const [current] = loopmax(level - 1, alpha, beta);
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
    }

    if (!found) {
      if (level <= 0) {
        value = player.evaluate(board);
      } else {
        prune = false;
        for (const move of findMoves()) {
          if (prune) {
            continue;
          }
          const [current] = loopmax(level - 1, alpha, beta);
          if (current < value) {
            value = current;
            play = move;
          }
          if (value <= alpha) {
            prune = true;
          }
          if (value < beta) {
            beta = value;
          }
        }
      }
    }

    return [value, play] as const;
  }

  // start the descent
  return side === RED
    ? loopmax(LEVEL, -Infinity, +Infinity)
    : loopmin(LEVEL, -Infinity, +Infinity);
}
