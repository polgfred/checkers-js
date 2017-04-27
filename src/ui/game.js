'use strict';

import React, { Component } from 'react';
import autobind from 'autobind-decorator';

import { newBoard } from '../utils';

import Board from './board';
import { UIPlayer } from './player';

export default class Game extends Component {
  constructor() {
    super();

    this.state = {
      board: newBoard(),
      side: 1
    };
  }

  render() {
    let { board, side } = this.state;

    return <UIPlayer board={board} side={side}
                     moveComplete={this.moveComplete} />;
  }

  @autobind
  moveComplete(board) {
    let { side } = this.state;

    this.setState({ board, side: -side });
  }
}
