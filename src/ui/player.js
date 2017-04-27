'use strict';

import React, { Component } from 'react';
import autobind from 'autobind-decorator';

import Rules from '../rules';
import { copyBoard } from '../utils';

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

export class UIPlayer extends Player {
  constructor(props) {
    super();

    let { board, side } = props;

    board = copyBoard(board);

    this.state = {
      board,
      side,
      plays: new Rules(board, side).collectTree(),
      current: []
    };
  }

  componentWillReceiveProps(nextProps) {
    let { board, side } = nextProps;

    board = copyBoard(board);

    this.setState({
      board,
      side,
      plays: new Rules(board, side).collectTree(),
      current: []
    });
  }

  @autobind
  canDrag(props) {
    let { plays } = this.state, { x, y } = props;

    // see if this position is in the tree
    if (plays[`${x},${y}`]) {
      return true;
    }
  }

  @autobind
  canDrop(props, item) {
    let { plays } = this.state,
        { x: nx, y: ny } = props,
        { x, y } = item;

    // see if this move is in the tree
    let next = plays[`${x},${y}`];
    if (next && next[`${nx},${ny}`]) {
      return true;
    }
  }

  @autobind
  endDrag(item1, item2) {
    if (!item2) {
      // dropped on an invalid square
      return;
    }

    let { board, side, plays } = this.state,
        { x, y } = item1,
        { x: nx, y: ny } = item2;

    // see if this move is in the tree
    let next = plays[`${x},${y}`];
    if (next) {
      let next2 = next[`${nx},${ny}`];
      if (next2) {
        let p = board[y][x],
            promoted = (p == 1 && ny == 7) || (p == -1 && ny == 0);

        // move the piece
        board[y][x] = 0;
        board[ny][nx] = promoted ? 2 * p : p;

        // it's a jump, so remove the jumped piece too
        if (Math.abs(nx - x) == 2) {
          let mx = (x + nx) / 2, my = (y + ny) / 2;
          board[my][mx] = 0;
        }

        if (Object.keys(next2).length == 0) {
          // move is done, switch sides
          this.props.moveComplete(board);
        } else {
          // commit this position
          this.setState({ board, plays: next });
        }
      }
    }
  }
}

export class AIPlayer extends Player {
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
