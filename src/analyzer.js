'use strict';

import Rules from './rules';

export default class Analyzer extends Rules {
  constructor(board, side) {
    super(board, side);

    this.level = 6;
    this.value = 0;
  }

  ptable = [
    new Int8Array([  0,  0,  0,  0,  0,  0,  0,  0 ]),
    new Int8Array([ 75,  0, 78,  0, 78,  0, 75,  0 ]),
    new Int8Array([  0, 67,  0, 72,  0, 72,  0, 67 ]),
    new Int8Array([ 61,  0, 67,  0, 67,  0, 61,  0 ]),
    new Int8Array([  0, 58,  0, 61,  0, 61,  0, 58 ]),
    new Int8Array([ 56,  0, 58,  0, 58,  0, 56,  0 ]),
    new Int8Array([  0, 55,  0, 56,  0, 56,  0, 55 ]),
    new Int8Array([ 55,  0, 58,  0, 58,  0, 55,  0 ])
  ].reverse();

  ktable = [
    new Int8Array([  0, 92,  0, 85,  0, 85,  0, 85 ]),
    new Int8Array([ 92,  0, 92,  0, 92,  0, 92,  0 ]),
    new Int8Array([  0, 92,  0, 99,  0, 99,  0, 85 ]),
    new Int8Array([ 85,  0, 99,  0, 99,  0, 92,  0 ]),
    new Int8Array([  0, 92,  0, 99,  0, 99,  0, 85 ]),
    new Int8Array([ 85,  0, 99,  0, 99,  0, 92,  0 ]),
    new Int8Array([  0, 92,  0, 92,  0, 92,  0, 92 ]),
    new Int8Array([ 85,  0, 85,  0, 85,  0, 92,  0 ])
  ].reverse();

  evaluate() {
    let score = 0;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        switch (this.board[y][x]) {
          case +1:
            score += this.ptable[y][x];
            break;
          case -1:
            score -= this.ptable[7-y][7-x];
            break;
          case +2:
            score += this.ktable[y][x];
            break;
          case -2:
            score -= this.ktable[7-y][7-x];
            break;
        }
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