import React, { Component } from 'react';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const pieceImages = new Map();
pieceImages[+1] = 'src/images/pr.png';
pieceImages[+2] = 'src/images/kr.png';
pieceImages[-1] = 'src/images/pw.png';
pieceImages[-2] = 'src/images/kw.png';

@DragDropContext(HTML5Backend)
export default class Board extends Component {
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
        { this.renderCells(y) }
      </tr>);
    }

    return elems;
  }

  renderCells(y) {
    let { board } = this.props, elems = [];

    for (let x = 0; x <= 7; ++x) {
      let p = board[y][x];

      if ((x + y) % 2 == 0) {
        elems.push(<Cell key={x} x={x} y={y} p={p} />);
      } else {
        elems.push(<td key={x} />);
      }
    }

    return elems;
  }
}

let dropTarget = {
  drop(props, monitor) {
  }
};

function dropCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

@DropTarget('piece', dropTarget, dropCollect)
class Cell extends Component {
  render() {
    let { x, y, p, connectDropTarget, isOver } = this.props;
    return connectDropTarget(<td className={`playable ${isOver ? 'dragging' : ''}`}>
      { p != 0 && <Piece p={p} /> }
    </td>);
  }
}

let dragSource = {
  beginDrag(props) {
    return {};
  }
};

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

@DragSource('piece', dragSource, dragCollect)
class Piece extends Component {
  render() {
    let { p, connectDragSource, isDragging } = this.props;
    return connectDragSource(<img src={pieceImages[p]} />);
  }
}
