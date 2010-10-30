// the global game object
var GAME;
dojo.addOnLoad(function () {
  GAME = new Game();
});

dojo.declare('SquareSource', dojo.dnd.Source, {
  singular: true, // don't allow multiple selection regardless of key state
  autoSync: true, // always sync up node list with square contents

  constructor: function (node, x, y) {
    // keep track of the coords for this square
    this.x = x;
    this.y = y;
  },

  copyState: function () {
    // never allow pieces to be copied
    return false;
  },

  checkAcceptance: function (source) {
    // whether the drop is a valid move
    return GAME.isPlay(source.x, source.y, this.x, this.y);
  },

  onDrop: function (source) {
    // let the game do it
    GAME.handleDrop(source.x, source.y, this.x, this.y);
  }
});

dojo.declare('Game', null, {
  pieceImages: {
     '1': 'pr.png',
     '2': 'kr.png',
    '-1': 'pw.png',
    '-2': 'kw.png'
  },

  constructor: function () {
    this._side  = 1;
    this._board = [
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [ -1,  0, -1,  0, -1,  0, -1,  0 ],
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ],
      [  0,  1,  0,  1,  0,  1,  0,  1 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ]
    ].reverse();

    var rules = new Rules(this._board, this._side);
    this.updatePlayMap(rules.collectPlays());
    this.setupBoard();
  },

  xhrStartup: function () {
    // get a new game from the server
    dojo.xhrGet({
      url: '/new',
      handleAs: 'json',
      load: dojo.hitch(this, function (res) {
        // set up the game attributes
        this._side = res.side;
        this._board = res.board;
        this.setupBoard();
        this.updatePlayMap(res.plays);
      })
    });
  },

  setupBoard: function () {
    // create the board and set up targets
    var table = dojo.byId('board');
    // create the table rows
    for (var y = 7; y >= 0; y--) {
      var tr = dojo.create('tr', {}, table);
      // create the table cells
      for (var x = 0; x <= 7; x++) {
        // test that the square is playable
        if ((x + y) % 2 == 0) {
          // create playable square
          var td = dojo.create('td', {'class': 'on'}, tr);
          var p = this._board[y][x];
          if (p != 0) {
            // create image tag for piece
            var img = dojo.create('img', {'class': 'dojoDndItem'}, td);
            img.src = '../images/' + this.pieceImages[p];
          }
          // create the drag/drop source
          new SquareSource(td, x, y);
        } else {
          // create non-playable square
          dojo.create('td', {'class': 'off'}, tr);
        }
      }
    }
  },

  moveImg: function (x, y, nx, ny, p) {
    var tr  = dojo.query('#board tr')[7 - y];
    var td  = dojo.query('> td', tr)[x];
    var img = dojo.query('> img', td)[0];
    var ntr = dojo.query('#board tr')[7 - ny];
    var ntd = dojo.query('> td', ntr)[nx];
    dojo.place(img, ntd);
    if (p) img.src = '../images/' + this.pieceImages[p];
  },

  removeImg: function (x, y) {
    var tr  = dojo.query('#board tr')[7 - y];
    var td  = dojo.query('> td', tr)[x];
    var img = dojo.query('> img', td)[0];
    dojo.destroy(img);
  },

  handleDrop: function (x, y, nx, ny) {
    // just in case, we'll check again
    var playMap = this.isPlay(x, y, nx, ny);
    if (!playMap) return;
    this.movePiece(x, y, nx, ny);
    // keep track of this move
    if (this._move.length == 0) {
      this._move.push(x);
      this._move.push(y);
    }
    this._move.push(nx);
    this._move.push(ny);
    // see if any plays remain
    this._playMap = {};
    if (playMap == true) {
      // move complete
      this.onPlayComplete();
    } else if (playMap) {
      // still your move
      this._playMap[nx + ',' + ny] = playMap;
    }
  },

  promote: function (ny, p) {
    if (p ==  1 && ny == 7) return  2;
    if (p == -1 && ny == 0) return -2;
    return p;
  },

  movePiece: function (x, y, nx, ny) {
    // move the piece
    var p = this.promote(ny, this._board[y][x]);
    this._board[y][x] = 0;
    this._board[ny][nx] = p;
    this.moveImg(x, y, nx, ny, p);
    if (Math.abs(nx - x) == 2) {
      // remove the jumped piece
      var mx = (x + nx) / 2;
      var my = (y + ny) / 2
      this._board[my][mx] = 0;
      this.removeImg(mx, my);
    }
  },

  moveAll: function (move) {
    this.movePiece(move[0], move[1], move[2], move[3]);
    if (move.length > 4) {
      this.moveAll(move.slice(2));
    }
  },

  onPlayComplete: function () {
    console.log(this._move);
    
  },

  xxxonPlayComplete: function () {
    // show human move
    var hist = dojo.query('#move-history tbody')[0];
    var hrow = dojo.create('tr', {}, hist);
    this.putHistory(hrow, this._move);
    // get next move from the server
    dojo.xhrGet({
      url: '/play',
      handleAs: 'json',
      content: {move: dojo.toJson(this._move)},
      load: dojo.hitch(this, function (res) {
        this.moveAll(res.move);
        this.putHistory(hrow, res.move);
        this.updatePlayMap(res.plays);
      })
    });
  },

  isPlay: function (x, y, nx, ny) {
    // whether this is a valid move
    var fromMap = this._playMap[x + ',' + y];
    if (fromMap) return fromMap[nx + ',' + ny];
  },

  putHistory: function (tr, move) {
    var td = dojo.create('td', {}, tr);
    var s = '';
    while (move.length != 0) {
      s += ('\u2192' + move[0] + ':' + move[1]);
      move = move.slice(2);
    }
    td.innerHTML = s.substr(1);
  },

  updatePlayMap: function (plays) {
    this._move = [];
    this._playMap = {};
    dojo.forEach(plays, function (play) {
      this.injectPlay(this._playMap, play);
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
