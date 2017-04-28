'use strict';

import Rules from './rules';

// these arrays are flat
const ptable = new Int8Array([
  55,  0, 58,  0, 58,  0, 55,  0,
   0, 55,  0, 56,  0, 56,  0, 55,
  56,  0, 58,  0, 58,  0, 56,  0,
   0, 58,  0, 61,  0, 61,  0, 58,
  61,  0, 67,  0, 67,  0, 61,  0,
   0, 67,  0, 72,  0, 72,  0, 67,
  75,  0, 78,  0, 78,  0, 75,  0,
   0,  0,  0,  0,  0,  0,  0,  0
]);

const ktable = new Int8Array([
  85,  0, 85,  0, 85,  0, 92,  0,
   0, 92,  0, 92,  0, 92,  0, 92,
  85,  0, 99,  0, 99,  0, 92,  0,
   0, 92,  0, 99,  0, 99,  0, 85,
  85,  0, 99,  0, 99,  0, 92,  0,
   0, 92,  0, 99,  0, 99,  0, 85,
  92,  0, 92,  0, 92,  0, 92,  0,
   0, 92,  0, 85,  0, 85,  0, 85
]);

export default class Analyzer extends Rules {
  constructor(board, side) {
    super(board, side);

    // a flat version of the board backed by the same data
    this.flat = new Int8Array(board[0].buffer, 0, 64);

    // how many levels deep to search the tree
    this.level = 6;
  }

  evaluate() {
    let score = 0;

    for (let i = 0; i < 64; ++i) {
      switch (this.flat[i]) {
        case +1:
          score += ptable[i];
          break;
        case -1:
          score -= ptable[63 - i];
          break;
        case +2:
          score += ktable[i];
          break;
        case -2:
          score -= ktable[63 - i];
          break;
      }
    }

    return score;
  }

  run() {
    let bestScore, bestPlay, score;

    this.myPlays(play => {
      this.side = -this.side;

      if (this.level < 1 && !this.myJumps(() => {})) {
        this.side = -this.side;
        score = this.evaluate();
      } else {
        this.level--;
        score = this.run()[1];
        this.level++;
        this.side = -this.side;
      }

      if (bestScore === undefined ||
          (this.side == +1 && score > bestScore) ||
          (this.side == -1 && score < bestScore)) {
        bestScore = score;
        bestPlay  = play;
      }
    });

    if (bestScore === undefined) {
      bestScore = this.side == 1 ?
        (this.dcount == 0 ? -Infinity : 0) :
        (this.lcount == 0 ? +Infinity : 0);
    }

    return [bestPlay, bestScore];
  }
}
