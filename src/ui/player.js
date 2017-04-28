'use strict';

import React, { Component } from 'react';
import autobind from 'autobind-decorator';

import Board from './board';

export default class Player extends Component {
  render() {
    let { board, side } = this.state;

    return <Board board={board} side={side}
                  canDrag={this.canDrag}
                  canDrop={this.canDrop}
                  endDrag={this.endDrag} />;
  }

  // hook to start play

  play() {
  }

  // default drag/drop handlers

  @autobind
  canDrag() {
    return false;
  }

  @autobind
  canDrop() {
    return false;
  }

  @autobind
  endDrag() {
    return false;
  }
}
