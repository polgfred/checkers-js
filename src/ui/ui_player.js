'use strict';

import React, { Component } from 'react';
import autobind from 'autobind-decorator';

import Rules from '../rules';
import { copyBoard } from '../utils';

import Player from './player';

export default class UIPlayer extends Player {
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
  canDrag(from) {
    let { plays } = this.state, { x, y } = from;

    // see if this position is in the tree
    if (plays[`${x},${y}`]) {
      return true;
    }
  }

  @autobind
  canDrop(from, to) {
    let { plays } = this.state,
        { x: nx, y: ny } = from,
        { x, y } = to;

    // see if this move is in the tree
    let next = plays[`${x},${y}`];
    if (next && next[`${nx},${ny}`]) {
      return true;
    }
  }

  @autobind
  endDrag(from, to) {
    if (!to) {
      // dropped on an invalid square
      return;
    }

    let { board, side, plays, current } = this.state,
        { x, y } = from,
        { x: nx, y: ny } = to;

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

        // record the current leg
        if (current.length == 0) {
          current.push(x, y);
        }
        current.push(nx, ny);

        if (Object.keys(next2).length == 0) {
          // move is done, switch sides
          this.props.moveComplete(board, current);
        } else {
          // commit this position
          this.setState({ board, plays: next, current });
        }
      }
    }
  }
}
