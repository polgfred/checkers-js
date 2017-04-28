'use strict';

import React, { Component } from 'react';

export default class History extends Component {
  render() {
    let { moves } = this.props, elems = [];

    for (let i = 0; i < moves.length; i += 2) {
      elems.push(<tr>
        <td>{ moves[i] && moves[i].join('-') }</td>
        <td>{ moves[i+1] && moves[i+1].join('-') }</td>
      </tr>);
    }

    return <table>
      <tbody>
        { elems }
      </tbody>
    </table>;
  }
}
