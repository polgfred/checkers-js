'use strict';

import React, { Component } from 'react';

import { moveToString } from '../core/utils';

export default class History extends Component {
  render() {
    let { moves } = this.props, elems = [];

    for (let i = 0; i < moves.length; i += 2) {
      elems.push(<tr key={i}>
        <td>{ moveToString(moves[i]) }</td>
        <td>{ moveToString(moves[i+1]) }</td>
      </tr>);
    }

    return <table>
      <tbody>
        { elems }
      </tbody>
    </table>;
  }
}
