'use strict';

import React, { Component } from 'react';
import { Row, Column } from 'react-foundation';
import autobind from 'autobind-decorator';

import { newBoard } from '../utils';

import Board from './board';
import UIPlayer from './ui_player';
import AIPlayer from './ai_player';

export default class Game extends Component {
  constructor() {
    super();

    this.state = {
      board: newBoard(),
      side: 1
    };
  }

  render() {
    let { board, side } = this.state,
        Player = side == 1 ? UIPlayer : AIPlayer;

    return <Row>
      <Column large={6}>
        <Player ref="player"
                board={board} side={side}
                moveComplete={this.moveComplete} />
      </Column>
      <Column large={6}>
      </Column>
    </Row>;
  }

  @autobind
  moveComplete(board) {
    let { side } = this.state;

    this.setState({ board, side: -side }, () => {
      this.refs.player.play();
    });
  }
}
