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

    return plays.some(([tx, ty]) => x == tx && y == ty);
  }

  @autobind
  canDrop(props, item) {
    let { player, plays } = this.state,
        { x: nx, y: ny } = props,
        { x, y } = item;

    // if computer's turn, don't allow dragging at all
    if (player == 'computer') {
      return false;
    }

    return plays.some(
              ([tx, ty, tnx, tny]) =>
                x == tx && y == ty && nx == tnx && ny == tny);
  }

  @autobind
  handleDrop(props, item) {
    let { plays } = this.state,
        { x: nx, y: ny } = props,
        { x, y } = item;

    let next = this.checkPlay([x, y, nx, ny]);

    if (!next) {
      return;
    }

    this.setState(state => {
      let { board, side } = state,
          p = board[y][x],
          promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0);

      // make the move
      board[y][x] = 0;
      board[ny][nx] = promoted ? 2 * p : p;

      // it's a jump, so remove the jumped piece
      if (Math.abs(nx - x) == 2) {
        let mx = (x + nx) / 2, my = (y + ny) / 2;
        board[my][mx] = 0;
      }

      // build the next state
      let nstate = {
        board: board,
        player: 'human'
      }

      if (next === true) {
        // move is done, switch sides
        nstate.side = -side;
        this.setupRules(nstate);
      } else {
        // get plays from this position
        nstate.plays = next;
      }

      return nstate;
    });
  }

  checkPlay(play) {
    let { plays, current } = this.state, next = [];

    if (current.length) {
      play = current.concat(play.slice(2))
    }

    top:
    for (let i = 0; i < plays.length; ++i) {
      let p = plays[i];
      if (play.length <= p.length) {
        let j;
        for (j = 0; j < play.length; ++j) {
          if (play[j] != p[j]) {
            continue top;
          }
        }
        if (j == p.length) {
          return true;
        } else {
          next.push(p.slice(j - 2));
        }
      }
    }

    if (next.length) {
      return next;
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
