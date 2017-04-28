'use strict';

import React, { Component } from 'react';
import autobind from 'autobind-decorator';

import Player from './player';

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
    this.worker = new Worker('./dist/worker-bundle.js');
    this.worker.addEventListener('message', this.onComplete, false);
  }

  componentWillUnmount() {
    this.worker.removeEventListener('message', this.onComplete, false);
  }

  play() {
    this.worker.postMessage(this.state);
  }

  @autobind
  onComplete(ev) {
    let { board } = this.state, move = ev.data.move;

    for (let i = 0; i < move.length - 2; i += 2) {
      let x = move[i],
          y = move[i+1],
          nx = move[i+2],
          ny = move[i+3],
          p = board[y][x],
          promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0);

      // move the piece
      board[y][x] = 0;
      board[ny][nx] = promoted ? 2 * p : p;

      // it's a jump, so remove the jumped piece too
      if (Math.abs(nx - x) == 2) {
        let mx = (x + nx) / 2, my = (y + ny) / 2;
        board[my][mx] = 0;
      }
    }

    // commit this position
    this.props.moveComplete(board);
  }
}
