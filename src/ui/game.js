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
    state.plays = state.rules.collectTree();
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

    // see if this position is in the tree
    if (plays[`${x},${y}`]) {
      return true;
    }
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

    // see if this move is in the tree
    let next = plays[`${x},${y}`];
    if (next && next[`${nx},${ny}`]) {
      return true;
    }
  }

  @autobind
  handleDrop(props, item) {
    let { plays } = this.state,
        { x: nx, y: ny } = props,
        { x, y } = item;

    // see if this move is in the tree
    let next = plays[`${x},${y}`];
    if (next) {
      let next2 = next[`${nx},${ny}`];
      if (next2) {
        // build the next state
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
            board,
            player: 'human'
          }

          if (Object.keys(next2).length == 0) {
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
