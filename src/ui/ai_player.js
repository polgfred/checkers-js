'use strict';

import React, { Component } from 'react';
import autobind from 'autobind-decorator';

import Player from './player';

// create a worker once that we'll attach to as needed
const worker = new Worker('./dist/worker-bundle.js');

export default class AIPlayer extends Player {
  constructor(props) {
    super();

    let { board, side } = props;

    this.state = {
      board,
      side
    };
  }

  componentDidMount() {
    worker.addEventListener('message', this.onComplete, false);
  }

  componentWillUnmount() {
    worker.removeEventListener('message', this.onComplete, false);
  }

  play() {
    worker.postMessage(this.state);
  }

  @autobind
  onComplete(ev) {
    let { board, side } = this.state,
        { move } = ev.data,
        len = move.length,
        [x, y] = move[0],
        [fx, fy] = move[len - 1],
        p = board[y][x],
        top = side == 1 ? 7 : 0,
        crowned = p == side && fy == top;

    // remove the initial piece
    board[y][x] = 0;

    for (let i = 1; i < len; ++i) {
      if (move[i].length > 2) {
        let [,, mx, my] = move[i];

        // perform the jump
        board[my][mx] = 0;
      }
    }

    // final piece
    board[fy][fx] = crowned ? p * 2 : p;

    // commit this position
    this.props.moveComplete(board, move);
  }
}
