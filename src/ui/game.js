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
