'use strict';

import React, { Component } from 'react';
import { Row, Column } from 'react-foundation';
import autobind from 'autobind-decorator';

import { newBoard } from '../core/utils';

import Board from './board';
import History from './history';
import UIPlayer from './ui_player';
import AIPlayer from './ai_player';

export default class Game extends Component {
  constructor() {
    super();

    this.state = {
      board: newBoard(),
      side: 1,
      hist: []
    };
  }

  render() {
    let { board, side, hist } = this.state,
        Player = side == 1 ? UIPlayer : AIPlayer;

    return <Row>
      <Column large={6}>
        <Player ref="player"
                board={board} side={side}
                moveComplete={this.moveComplete} />
      </Column>
      <Column large={6}>
        <History moves={hist} />
      </Column>
    </Row>;
  }

  @autobind
  moveComplete(board, move) {
    let { side, hist } = this.state;

    hist.push(move);

    this.setState({ board, side: -side, hist }, () => {
      this.refs.player.play();
    });
  }
}
