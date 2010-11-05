dojo.declare('Rules.Base', null, {
  dirsMap: {
     '1': [[ 1,  1], [-1,  1]],
     '2': [[ 1,  1], [-1,  1], [ 1, -1], [-1, -1]],
    '-1': [[-1, -1], [ 1, -1]],
    '-2': [[-1, -1], [ 1, -1], [-1,  1], [ 1,  1]]
  },

  constructor: function (board, side) {
    this.board = board;
    this.side  = side;
  },

  doDirs: function (p, block) {
    var dirs = this.dirsMap[p];

    for (var i = 0; i < dirs.length; ++i) {
      var dir = dirs[i];
      var dx  = dir[0];
      var dy  = dir[1];

      block.call(this, dx, dy);
    }
  },

  doSquares: function (block) {
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
  },

  doJumps: function (x, y, p, current, block) {
    var found = false;

    this.doDirs(p, function (dx, dy) {
      var mx =  x + dx;
      var nx = mx + dx;
      var my =  y + dy;
      var ny = my + dy;

      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        var p = this.board[y][x];
        var m = this.board[my][mx];
        var n = this.board[ny][nx];

        if ((m * this.side) < 0 && n == 0) {
          found = true;

          var promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0);
          var ncurrent = current.concat([nx, ny]);
          var q = (promoted ? p * 2: p);

          this.board[y][x]   = 0;
          this.board[my][mx] = 0;
          this.board[ny][nx] = q;

          if (promoted || !this.doJumps(nx, ny, p, ncurrent, block)) {
            block.call(this, ncurrent);
          }

          this.board[y][x]   = p;
          this.board[my][mx] = m;
          this.board[ny][nx] = 0;
        }
      }
    });

    return found;
  },

  myJumps: function (block) {
    var found = false;

    this.doSquares(function (x, y, p) {
      this.doJumps(x, y, p, [x, y], function (current) {
        found = true;
        block.call(this, current);
      });
    });

    return found;
  },

  doMoves: function (x, y, p, block) {
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
  },

  myMoves: function (block) {
    var found = false;

    this.doSquares(function (x, y, p) {
      this.doMoves(x, y, p, function (current) {
        found = true;
        block.call(this, current);
      });
    });

    return found;
  },

  myPlays: function (block) {
    return this.myJumps(block) || this.myMoves(block);
  },

  collectPlays: function () {
    var plays = [];

    this.myPlays(function (play) {
      plays.push(play);
    });

    return plays;
  }
});

dojo.declare('Rules.Player', Rules.Base, {
  ptable: [
    [ 00, 00, 00, 00, 00, 00, 00, 00 ],
    [ 75, 00, 78, 00, 78, 00, 75, 00 ],
    [ 00, 67, 00, 72, 00, 72, 00, 67 ],
    [ 61, 00, 67, 00, 67, 00, 61, 00 ],
    [ 00, 58, 00, 61, 00, 61, 00, 58 ],
    [ 56, 00, 58, 00, 58, 00, 56, 00 ],
    [ 00, 55, 00, 56, 00, 56, 00, 55 ],
    [ 55, 00, 58, 00, 58, 00, 55, 00 ]
  ].reverse(),

  ktable: [
    [ 00, 92, 00, 85, 00, 85, 00, 85 ],
    [ 92, 00, 92, 00, 92, 00, 92, 00 ],
    [ 00, 92, 00, 99, 00, 99, 00, 85 ],
    [ 85, 00, 99, 00, 99, 00, 92, 00 ],
    [ 00, 92, 00, 99, 00, 99, 00, 85 ],
    [ 85, 00, 99, 00, 99, 00, 92, 00 ],
    [ 00, 92, 00, 92, 00, 92, 00, 92 ],
    [ 85, 00, 85, 00, 85, 00, 92, 00 ]
  ].reverse(),

  constructor: function (board, side) {
    this.level = 3;
    this.value = 0;
  },

  evaluate: function () {
    var score = 0;

    for (var y = 0; y < 8; ++y) {
      for (var x = 0; x < 8; ++x) {
        switch (this.board[y][x]) {
          case  0:
            score += 0;
            break;
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
        }
      }
    }

    return score;
  },

  noop: function () {
  },

  run: function () {
    var bestScore;
    var bestPlay;
    var score;

    this.myPlays(function (play) {
      if (this.level < 1 && !this.myJumps(this.noop)) {
        score = this.evaluate();
      } else {
        this.level--;
        this.side = -this.side;
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

    return [bestPlay, bestScore];
  }
});
