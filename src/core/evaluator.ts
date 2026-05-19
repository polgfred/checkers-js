import { type BoardType, type FormationType, type ScoresType } from './types';

export interface Evaluator {
  getScores: () => ScoresType;
  addFormation: (formation: FormationType, scores: readonly number[][]) => void;
  evaluate: (board: BoardType) => number;
}

export function makeEvaluator(): Evaluator {
  // scores are represented as a 2D array of [pattern, score] pairs, where:
  //  - `pattern` is an array of { dx, dy, value } entries, and
  //  - `score` is what will be awarded if the pattern matches
  const scores = [[], [], [], [], [], [], [], []] as ScoresType;

  function addFormation(formation: FormationType, values: readonly number[][]) {
    // `formation` takes the form [{ dx, dy, value }, ...], where:
    //  - (dx, dy) is the offset from the origin of the formation, and
    //  - value is the value to match against:
    //    -  0: an empty square
    //    - +1: a regular piece on my side
    //    - +2: a king on my side
    //    - +3: any piece on my side
    //    - -1: a regular piece on my opponent's side
    //    - -2: a king on my opponent's side
    //    - -3: any piece on my opponent's side
    // `values` is an 8x8 array of values representing the bonus (or penalty)
    //    awarded when the formation's origin matches the given position

    // push on the pattern and score for each non-zero slot
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const score = values[y][x];

        if (score !== 0) {
          scores[y][x] = scores[y][x] || [];
          scores[y][x].push({ formation, score });
        }
      }
    }
  }

  function evaluate(board: BoardType) {
    // match the board and side against the formations and return a score:
    //  - for each square on the board, get the set of formations on it
    //  - for each formation, see if it applies to red (+) from the top of
    //      the board, or white (-) from the bottom, and adjust the total
    //      score accordingly
    let total = 0;

    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const formations = scores[y][x];

        if (formations) {
          for (const { formation, score } of formations) {
            let match: boolean;

            // try the pattern as red
            match = true;
            for (const { dx, dy, value: v } of formation) {
              const px = x + dx;
              const py = y + dy;

              if (px < 0 || px >= 8 || py < 0 || py >= 8) {
                match = false;
                break;
              }

              const p = board[py][px];

              // see if the formation matches for this square
              if (
                !(
                  (v === 0 && p === 0) ||
                  ((v === 1 || v === 3) && p === 1) ||
                  ((v === 2 || v === 3) && p === 2) ||
                  ((v === -1 || v === -3) && p === -1) ||
                  ((v === -2 || v === -3) && p === -2)
                )
              ) {
                // bail out and flag as failed
                match = false;
                break;
              }
            }
            if (match) {
              total += score;
            }

            // try the pattern as white
            match = true;
            for (const { dx, dy, value: v } of formation) {
              const px = (x ^ 7) - dx;
              const py = (y ^ 7) - dy;

              if (px < 0 || px >= 8 || py < 0 || py >= 8) {
                match = false;
                break;
              }

              const p = board[py][px];

              // see if the pattern matches for this square
              if (
                !(
                  (v === 0 && p === 0) ||
                  ((v === 1 || v === 3) && p === -1) ||
                  ((v === 2 || v === 3) && p === -2) ||
                  ((v === -1 || v === -3) && p === 1) ||
                  ((v === -2 || v === -3) && p === 2)
                )
              ) {
                // bail out and flag as failed
                match = false;
                break;
              }
            }
            if (match) {
              total -= score;
            }
          }
        }
      }
    }

    return total;
  }

  return {
    getScores: () => scores,
    addFormation,
    evaluate,
  };
}
