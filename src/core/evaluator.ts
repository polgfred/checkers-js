import { BoardType } from './rules';

export type FormationType = [number, number, number][];
export type ScoresType = [FormationType, number][][][];

export type Evaluator = {
  getScores: () => ScoresType;
  addFormation: (formation: FormationType, scores: number[][]) => void;
  evaluate: (board: BoardType) => number;
};

export function makeEvaluator(): Evaluator {
  // scores are represented as a 2D array of [pattern, score] pairs, where:
  //  - `pattern` is an array of [dx, dy, value] triples, and
  //  - `score` is what will be awarded if the pattern matches
  const scores: ScoresType = [[], [], [], [], [], [], [], []];

  function addFormation(formation: FormationType, values: number[][]) {
    // `formation` takes the form [[dx, dy, v], [dx, dy, v], ...], where:
    //  - (dx, dy) is the offset from the origin of the formation, and
    //  - v is the value to match against:
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
        const value = values[y][x];

        if (value !== 0) {
          scores[y][x] = scores[y][x] || [];
          scores[y][x].push([formation, value]);
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
        const r = scores[y][x];

        if (r) {
          for (let j = 0; j < r.length; ++j) {
            const [formation, score] = r[j];
            let match: boolean;

            // try the pattern as red
            match = true;
            for (let k = 0; k < formation.length; ++k) {
              const [dx, dy, v] = formation[k];
              const p = board[y + dy][x + dx];

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
            for (let k = 0; k < formation.length; ++k) {
              const [dx, dy, v] = formation[k];
              const p = board[(y ^ 7) - dy][(x ^ 7) - dx];

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
