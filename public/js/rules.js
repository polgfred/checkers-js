dojo.declare('Rules', null, {
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
    } else {
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
