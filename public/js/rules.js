Rules = {};

Rules.Base = function (board, side) {
  this.board = board;
  this.side = side;
  this.setupCounts();
};

Rules.Base.prototype = Object.create(Object.prototype, {
  dirsMap: {
    value: {
       '1': [[ 1,  1], [-1,  1]],
       '2': [[ 1,  1], [-1,  1], [ 1, -1], [-1, -1]],
      '-1': [[-1, -1], [ 1, -1]],
      '-2': [[-1, -1], [ 1, -1], [-1,  1], [ 1,  1]]
    }
  },

  setupCounts: {
    value: function () {
      this.dcount = 0;
      this.lcount = 0;

      for (var y = 0; y < 8; ++y) {
        for (var x = 0; x < 8; ++x) {
          var p = this.board[y][x];
          if (p > 0) {
            ++this.dcount;
          } else if (p < 0) {
            ++this.lcount;
          }
        }
      }
    }
  },

  doDirs: {
    value: function (p, block) {
      var dirs = this.dirsMap[p];

      for (var i = 0; i < dirs.length; ++i) {
        var dir = dirs[i];
        var dx  = dir[0];
        var dy  = dir[1];

        block.call(this, dx, dy);
      }
    }
  },

  doSquares: {
    value: function (block) {
      if (this.side == 1) {
        for (var y = 0; y < 8; ++y) {
          for (var x = 0; x < 8; ++x) {
            var p = this.board[y][x];

            if (p > 0) {
              block.call(this, x, y, p);
            }
          }
        }
      } else if (this.side == -1) {
        for (var y = 7; y >= 0; --y) {
          for (var x = 7; x >= 0; --x) {
            var p = this.board[y][x];

            if (p < 0) {
              block.call(this, x, y, p);
            }
          }
        }
      }
    }
  },

  doJumps: {
    value: function (x, y, p, current, block) {
      var found = false;
      var oppCount = this.side == 1 ? 'lcount' : 'dcount';

      this.doDirs(p, function (dx, dy) {
        var mx =  x + dx;
        var nx = mx + dx;
        var my =  y + dy;
        var ny = my + dy;

        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
          var p = this.board[y][x];
          var m = this.board[my][mx];
          var n = this.board[ny][nx];

          if (n == 0 && ((this.side ==  1 && m < 0) ||
                         (this.side == -1 && m > 0))) {
            found = true;

            var promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0);
            var ncurrent = current.concat([nx, ny]);
            var q = (promoted ? p * 2: p);

            this.board[y][x]   = 0;
            this.board[my][mx] = 0;
            this.board[ny][nx] = q;
            --this[oppCount];

            if (promoted || !this.doJumps(nx, ny, p, ncurrent, block)) {
              block.call(this, ncurrent);
            }

            this.board[y][x]   = p;
            this.board[my][mx] = m;
            this.board[ny][nx] = 0;
            ++this[oppCount];
          }
        }
      });

      return found;
    }
  },

  myJumps: {
    value: function (block) {
      var found = false;

      this.doSquares(function (x, y, p) {
        this.doJumps(x, y, p, [x, y], function (current) {
          found = true;
          block.call(this, current);
        });
      });

      return found;
    }
  },

  doMoves: {
    value: function (x, y, p, block) {
      var found = false;

      this.doDirs(p, function (dx, dy) {
        var nx = x + dx;
        var ny = y + dy;

        if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
          var p = this.board[y][x];
          var n = this.board[ny][nx];

          if (n == 0) {
            found = true;

            var promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0);
            var q = (promoted ? p * 2: p);

            this.board[y][x]   = 0;
            this.board[ny][nx] = q;

            block.call(this, [x, y, nx, ny]);

            this.board[y][x]   = p;
            this.board[ny][nx] = 0;
          }
        }
      });

      return found;
    }
  },

  myMoves: {
    value: function (block) {
      var found = false;

      this.doSquares(function (x, y, p) {
        this.doMoves(x, y, p, function (current) {
          found = true;
          block.call(this, current);
        });
      });

      return found;
    }
  },

  myPlays: {
    value: function (block) {
      return this.myJumps(block) || this.myMoves(block);
    }
  },

  collectPlays: {
    value: function () {
      var plays = [];

      this.myPlays(function (play) {
        plays.push(play);
      });

      return plays;
    }
  }
});

Rules.Player = function (board, side) {
  Rules.Base.call(this, board, side);
  this.level = 6;
  this.value = 0;
};

Rules.Player.prototype = Object.create(Rules.Base.prototype, {
  ptable: {
    value: [
      [ 00, 00, 00, 00, 00, 00, 00, 00 ],
      [ 75, 00, 78, 00, 78, 00, 75, 00 ],
      [ 00, 67, 00, 72, 00, 72, 00, 67 ],
      [ 61, 00, 67, 00, 67, 00, 61, 00 ],
      [ 00, 58, 00, 61, 00, 61, 00, 58 ],
      [ 56, 00, 58, 00, 58, 00, 56, 00 ],
      [ 00, 55, 00, 56, 00, 56, 00, 55 ],
      [ 55, 00, 58, 00, 58, 00, 55, 00 ]
    ].reverse()
  },

  ktable: {
    value: [
      [ 00, 92, 00, 85, 00, 85, 00, 85 ],
      [ 92, 00, 92, 00, 92, 00, 92, 00 ],
      [ 00, 92, 00, 99, 00, 99, 00, 85 ],
      [ 85, 00, 99, 00, 99, 00, 92, 00 ],
      [ 00, 92, 00, 99, 00, 99, 00, 85 ],
      [ 85, 00, 99, 00, 99, 00, 92, 00 ],
      [ 00, 92, 00, 92, 00, 92, 00, 92 ],
      [ 85, 00, 85, 00, 85, 00, 92, 00 ]
    ].reverse()
  },

  evaluate: {
    value: function () {
      var score = 0;

      for (var y = 0; y < 8; ++y) {
        for (var x = 0; x < 8; ++x) {
          switch (this.board[y][x]) {
            case  1:
              score += this.ptable[y][x];
              break;
            case -1:
              score -= this.ptable[7-y][7-x];
              break;
            case  2:
              score += this.ktable[y][x];
              break;
            case -2:
              score -= this.ktable[7-y][7-x];
              break;
            default:
              break;
          }
        }
      }

      return score;
    }
  },

  run: {
    value: function () {
      var bestScore;
      var bestPlay;
      var score;

      this.myPlays(function (play) {
        this.side = -this.side;

        if (this.level < 1 && !this.myJumps(function () {})) {
          this.side = -this.side;
          score = this.evaluate();
        } else {
          this.level--;
          score = this.run()[1];
          this.level++;
          this.side = -this.side;
        }

        if (bestScore === undefined ||
            (this.side ==  1 && score > bestScore) ||
            (this.side == -1 && score < bestScore)) {
          bestScore = score;
          bestPlay  = play;
        }
      });

      if (bestScore === undefined) {
        bestScore = this.side == 1 ?
          (this.dcount == 0 ? -Infinity : 0) :
          (this.lcount == 0 ?  Infinity : 0);
      }

      return [bestPlay, bestScore];
    }
  }
});
