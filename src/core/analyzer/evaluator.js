'use strict';

export default class Evaluator {
  constructor() {
    // rules are represented as an array of [pattern, score] pairs, where:
    //  - the array index is a number from 0-63 representing the square
    //  - `pattern` is an array of [offset, value] pairs, and
    //  - `score` is what will be awarded if the pattern matches
    this.rules = new Array(64);
  }

  addFormation(formation, scores) {
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
    // `scores` is an 8x8 array of values representing the bonus (or penalty)
    //    awarded when the formation's origin matches the given position
    let rules = this.rules, pattern = [];

    // convert the pattern coords to flat offsets
    for (let j = 0; j < formation.length; ++j) {
      let [dx, dy, v] = formation[j];
      pattern.push([8 * dy + dx, v]);
    }

    // push on the pattern and score for each non-zero slot
    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        let i = 8 * y + x, score = scores[y][x];
        if (score != 0) {
          rules[i] = (rules[i] || []);
          rules[i].push([pattern, score]);
        }
      }
    }
  }

  evaluate(flat) {
    // match the board and side against the formations and return a score:
    //  - for each square on the board, get the set of formations on it
    //  - for each formation, see if it applies to red (+) from the top of
    //      the board, or white (-) from the bottom, and adjust the total
    //      score accordingly
    let total = 0;

    for (let i = 0; i < 64; ++i) {
      let rules = this.rules;
      if (rules[i]) {
        for (let j = 0; j < rules[i].length; ++j) {
          let [pattern, score] = rules[i][j], match;
          // try the pattern as red
          match = true;
          for (let k = 0; k < pattern.length; ++k) {
            let [offset, v] = pattern[k], p = flat[i + offset];
            // see if the pattern matches for this square
            if (!((v == 0 && p == 0) ||
                  ((v == +1 || v == +3) && p == +1) ||
                  ((v == +2 || v == +3) && p == +2) ||
                  ((v == -1 || v == -3) && p == -1) ||
                  ((v == -2 || v == -3) && p == -2))) {
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
          for (let k = 0; k < pattern.length; ++k) {
            let [offset, v] = pattern[k], p = flat[63 - i - offset];
            // see if the pattern matches for this square
            if (!((v == 0 && p == 0) ||
                  ((v == +1 || v == +3) && p == -1) ||
                  ((v == +2 || v == +3) && p == -2) ||
                  ((v == -1 || v == -3) && p == +1) ||
                  ((v == -2 || v == -3) && p == +2))) {
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

    return total;
  }
}
