import React from 'react';

const pieceImages = new Map();
pieceImages[+1] = 'src/images/pr.png';
pieceImages[+2] = 'src/images/kr.png';
pieceImages[-1] = 'src/images/pw.png';
pieceImages[-2] = 'src/images/kw.png';

export default class Board extends React.Component {
  static defaultProps = {
    // initial checkerboard setup
    board: [
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [ -1,  0, -1,  0, -1,  0, -1,  0 ],
      [  0, -1,  0, -1,  0, -1,  0, -1 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ],
      [  0,  1,  0,  1,  0,  1,  0,  1 ],
      [  1,  0,  1,  0,  1,  0,  1,  0 ]
    ].reverse(),

    // red to start
    side: 1
  }

  render() {
    return <div id="board-container">
      <table id="board">
        <tbody>
          { this.renderRows() }
        </tbody>
      </table>
    </div>;
  }

  renderRows() {
    let elems = [];

    for (let y = 7; y >= 0; --y) {
      elems.push(<tr key={y}>
        { this.renderColumns(y) }
      </tr>);
    }

    return elems;
  }

  renderColumns(y) {
    let { board } = this.props, elems = [];

    for (let x = 0; x <= 7; ++x) {
      let p = board[y][x];

      if ((x + y) % 2 == 0) {
        elems.push(<td key={x} className="playable"><img src={pieceImages[p]} /></td>);
      } else {
        elems.push(<td key={x} />);
      }
    }

    return elems;
  }
}
