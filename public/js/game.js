dojo.declare('Game', null, {
  pieceImages: {
     '1': 'pr.png',
     '2': 'kr.png',
    '-1': 'pw.png',
    '-2': 'kw.png'
  },

  constructor: function () {
    this.players = [new Game.HumanPlayer(this, 1), new Game.HumanPlayer(this, -1)];
    this.side = 1;
    this.board = [
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [ -1,  0, -1,  0, -1,  0, -1,  0 ],
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ],
      [  0,  1,  0,  1,  0,  1,  0,  1 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ]
    ].reverse();

    this.setupBoard();
  },

  setupBoard: function () {
    var table = dojo.byId('board');
    for (var y = 7; y >= 0; y--) {
      var tr = dojo.create('tr', {'class': 'y' + y}, table);
      for (var x = 0; x <= 7; x++) {
        if ((x + y) % 2 == 0) {
          var td = dojo.create('td', {'class': 'x' + x}, tr);
          var p = this.board[y][x];
          if (p != 0) {
            var img = dojo.create('img', {'class': 'dojoDndItem'}, td);
            img.src = '../images/' + this.pieceImages[p];
          }
          new Game.SquareSource(td, this, x, y);
        } else {
          dojo.create('td', {}, tr);
        }
      }
    }
  },

  currentPlayer: function () {
    return this.players[this.side == 1 ? 0 : 1];
  },

  play: function () {
    console.log('player', this.side);
    this.currentPlayer().play().then(dojo.hitch(this, function () {
      this.side = -this.side;
      this.play();
    }));
  },

  moveImg: function (x, y, nx, ny, p) {
    var img = dojo.query(dojo.replace('#board tr.y{0} td.x{1} img', [y, x]))[0];
    var ntd = dojo.query(dojo.replace('#board tr.y{0} td.x{1}', [ny, nx]))[0];
    dojo.place(img, ntd);

    if (p) {
      img.src = '../images/' + this.pieceImages[p];
    }
  },

  removeImg: function (x, y) {
    var img = dojo.query(dojo.replace('#board tr.y{0} td.x{1} img', [y, x]))[0];
    dojo.destroy(img);
  },

  isPlay: function (x, y, nx, ny) {
    return this.currentPlayer().isPlay(x, y, nx, ny);
  },

  handleDrop: function (x, y, nx, ny) {
    this.movePiece(x, y, nx, ny);
    this.currentPlayer().handleDrop(x, y, nx, ny);
  },

  promote: function (ny, p) {
    if (p ==  1 && ny == 7) return  2;
    if (p == -1 && ny == 0) return -2;
    return p;
  },

  movePiece: function (x, y, nx, ny) {
    var p = this.promote(ny, this.board[y][x]);
    this.board[y][x] = 0;
    this.board[ny][nx] = p;
    this.moveImg(x, y, nx, ny, p);

    if (Math.abs(nx - x) == 2) {
      var mx = (x + nx) / 2;
      var my = (y + ny) / 2
      this.board[my][mx] = 0;
      this.removeImg(mx, my);
    }
  },

  moveAll: function (move) {
    this.movePiece(move[0], move[1], move[2], move[3]);
    if (move.length > 4) {
      this.moveAll(move.slice(2));
    }
  }
});

dojo.declare('Game.SquareSource', dojo.dnd.Source, {
  singular: true,  // don't allow multiple selection regardless of key state
  autoSync: true,  // always sync up node list with square contents
  isSource: false, // pieces aren't draggable until we flip the switch

  constructor: function (node, game, x, y) {
    this.game = game;
    this.x    = x;
    this.y    = y;
  },

  copyState: function () {
    return false; // never allow pieces to be copied
  },

  checkAcceptance: function (source) {
    return this.game.isPlay(source.x, source.y, this.x, this.y);
  },

  onDrop: function (source) {
    this.game.handleDrop(source.x, source.y, this.x, this.y);
  }
});

dojo.declare('Game.Player', null, {
  constructor: function (game, side) {
    this.game = game;
    this.side = side;
  }
});

dojo.declare('Game.HumanPlayer', Game.Player, {
  play: function () {
    this.move = [];
    this.updatePlayMap();
    Game.SquareSource.prototype.isSource = true; // enable dragging

    this.promise = new dojo.Deferred();
    return this.promise;
  },

  onPlayComplete: function () {
    Game.SquareSource.prototype.isSource = false;
    console.log('  moved', JSON.stringify(this.move));
    this.promise.resolve();
  },

  isPlay: function (x, y, nx, ny) {
    var fromMap = this.playMap[x + ',' + y];
    if (fromMap) return fromMap[nx + ',' + ny];
  },

  handleDrop: function (x, y, nx, ny) {
    // keep track of this move
    if (this.move.length == 0) {
      this.move.push(x);
      this.move.push(y);
    }
    this.move.push(nx);
    this.move.push(ny);

    // see if any plays remain
    var playMap = this.isPlay(x, y, nx, ny);
    this.playMap = {};
    if (playMap == true) {
      this.onPlayComplete();
    } else if (playMap) {
      this.playMap[nx + ',' + ny] = playMap;
    }
  },

  updatePlayMap: function (plays) {
    var rules = new Rules.Base(this.game.board, this.game.side);
    this.move = [];
    this.playMap = {};
    dojo.forEach(rules.collectPlays(), function (play) {
      this.injectPlay(this.playMap, play);
    }, this);
  },

  injectPlay: function (playMap, play) {
    var key = play[0] + ',' + play[1];
    if (play.length == 2) {
      playMap[key] = true;
    } else {
      playMap[key] = playMap[key] || {};
      this.injectPlay(playMap[key], play.slice(2));
    }
  }
});

var GAME; // the global game object

dojo.addOnLoad(function () {
  // the drag offset for moving pieces
  var manager = dojo.dnd.manager();
  manager.OFFSET_X = 2;
  manager.OFFSET_Y = 2;

  GAME = new Game();
  GAME.play();
});

