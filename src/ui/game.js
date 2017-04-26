'use strict';

import React, { Component } from 'react';
import autobind from 'autobind-decorator';

import Rules from '../rules';
import Player from '../player';

import Board from './board';

export default class Game extends Component {
  constructor() {
    super();

    this.state = {
      side: 1,
      board: this.initialBoard(),
      player: 'human'
    };

    this.setupRules(this.state);
  }

  initialBoard() {
    return [
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [ -1,  0, -1,  0, -1,  0, -1,  0 ],
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ],
      [  0,  1,  0,  1,  0,  1,  0,  1 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ]
    ].reverse();
  }

  render() {
    let { board, side } = this.state;

    return <Board board={board} side={side}
                  canDrag={this.canDrag}
                  canDrop={this.canDrop}
                  handleDrop={this.handleDrop} />;
  }

  setupRules(state) {
    let { board, side } = state;

    state.rules = new Rules(board, side);
    state.plays = state.rules.collectPlays();
    state.current = [];
  }

  @autobind
  canDrag(props) {
    let { player, plays } = this.state,
        { x, y } = props;

    // if computer's turn, don't allow dragging at all
    if (player == 'computer') {
      return false;
    }

    return !!plays.find(play => play[0] == x && play[1] == y);
  }

  @autobind
  canDrop(props, item) {
    let { plays } = this.state,
        { x: nx, y: ny } = props,
        { x, y } = item;

    return !!plays.find(play =>
              play[0] == x &&
              play[1] == y &&
              play[2] == nx &&
              play[3] == ny);
  }

  @autobind
  handleDrop(props, item) {
    let { plays } = this.state,
        { x: nx, y: ny } = props,
        { x, y } = item;

    if (this.canDrop(props, item)) {
      this.setState(state => {
        let { board, side } = state, p = board[y][x];

        // make the move
        board[y][x] = 0;
        board[ny][nx] = p;
        if (Math.abs(nx - x) == 2) {
          let mx = (x + nx) / 2, my = (y + ny) / 2;
          board[my][mx] = 0;
        }

        // build the next state
        let nstate = {
          board: board,
          side: -side,
          player: 'human'
        }

        this.setupRules(nstate);
        return nstate;
      });
    }
  }
}

class BasePlayer {
}

class HumanPlayer extends BasePlayer {
  play() {
  }
}

class MachinePlayer extends BasePlayer {
  play() {
  }
}

/*
dojo.declare('Game', null, {
  pieceImages: {
     '1': 'pr.png',
     '2': 'kr.png',
    '-1': 'pw.png',
    '-2': 'kw.png'
  },

  constructor: function () {
    this.side = 1;
    this.players = [
      new Game.HumanPlayer(this),
      new Game.MechanicalPlayer(this)
    ];
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
    this.sources = [];
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
          this.sources.push(new Game.SquareSource(td, this, x, y));
        } else {
          dojo.create('td', {}, tr);
        }
      }
    }
  },

  play: function () {
    console.log('player', this.side);
    this.current = this.players[this.side == 1 ? 0 : 1];
    this.current.play();
  },

  onPlayComplete: function (move) {
    console.log('  played', JSON.stringify(move));
    this.side = -this.side;
    this.play();
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
  }
});

dojo.declare('Game.SquareSource', dojo.dnd.Source, {
  singular: true,  // don't allow multiple selection regardless of key state
  autoSync: true,  // always sync up node list with square contents
  isSource: false, // pieces aren't draggable until we flip the switch

  constructor: function (node, game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
  },

  copyState: function () {
    return false; // never allow pieces to be copied
  },

  checkAcceptance: function (source) {
    return this.game.current.isPlay(source.x, source.y, this.x, this.y);
  },

  onDrop: function (source) {
    this.game.current.handleDrop(source.x, source.y, this.x, this.y);
  }
});

dojo.declare('Game.Player', null, {
  constructor: function (game) {
    this.game = game;
  }
});

dojo.declare('Game.HumanPlayer', Game.Player, {
  play: function () {
    this.move = [];
    this.updatePlayMap();
    this.updateDragSources();
  },

  onComplete: function () {
    this.clearDragSources();
    this.game.onPlayComplete(this.move);
  },

  handleDrop: function (x, y, nx, ny) {
    this.game.movePiece(x, y, nx, ny);

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
      this.onComplete();
    } else if (playMap) {
      this.playMap[nx + ',' + ny] = playMap;
      this.updateDragSources();
    }
  },

  updatePlayMap: function (plays) {
    function injectPlay(playMap, play) {
      var key = play[0] + ',' + play[1];
      if (play.length == 2) {
        playMap[key] = true;
      } else {
        playMap[key] = playMap[key] || {};
        injectPlay(playMap[key], play.slice(2));
      }
    }

    var rules = new Rules.Base(this.game.board, this.game.side);
    this.move = [];
    this.playMap = {};
    dojo.forEach(rules.collectPlays(), function (play) {
      injectPlay(this.playMap, play);
    }, this);
  },

  updateDragSources: function () {
    dojo.forEach(this.game.sources, function (source) {
      if ((source.x + ',' + source.y) in this.playMap) {
        source.isSource = true;
      } else {
        delete source.isSource;
      }
    }, this);
  },

  clearDragSources: function () {
    dojo.forEach(this.game.sources, function (source) {
      delete source.isSource;
    });
  },

  isPlay: function (x, y, nx, ny) {
    var fromMap = this.playMap[x + ',' + y];
    if (fromMap) {
      return fromMap[nx + ',' + ny];
    }
  }
});

dojo.declare('Game.MechanicalPlayer', Game.Player, {
  constructor: function (game) {
    this.worker = new Worker('../js/aiWorker.js');
    dojo.connect(this.worker, 'message', dojo.hitch(this, this.onComplete));
  },

  play: function () {
    this.worker.postMessage({ board: this.game.board, side: this.game.side });
  },

  onComplete: function (event) {
    var move = event.data.move;
    this.moveAll(move);
    this.game.onPlayComplete(move);
  },

  moveAll: function (move) {
    this.game.movePiece(move[0], move[1], move[2], move[3]);
    if (move.length > 4) {
      this.moveAll(move.slice(2));
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
*/
