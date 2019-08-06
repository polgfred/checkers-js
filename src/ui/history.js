import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { moveToString } from '../core/utils';

export default class History extends Component {
  render() {
    let { moves } = this.props,
      elems = [];

    for (let i = 0; i < moves.length; i += 2) {
      elems.push(
        <tr key={i}>
          <td>{moveToString(moves[i])}</td>
          <td>{moveToString(moves[i + 1])}</td>
        </tr>
      );
    }

    return (
      <div className="history-container">
        <table className="history">
          <thead>
            <tr>
              <th>Red</th>
              <th>White</th>
            </tr>
          </thead>
          <tbody>{elems}</tbody>
        </table>
      </div>
    );
  }

  componentDidUpdate() {
    // scroll to the bottom anytime we're updated
    let node = ReactDOM.findDOMNode(this);
    node.scrollTop = node.scrollHeight;
  }
}
