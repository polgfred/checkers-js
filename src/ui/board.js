import React, { Component } from 'react';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';

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
        elems.push(<Square key={x} x={x} y={y} p={p} />);
      } else {
        elems.push(<EmptySquare key={x} />);
      }
    }

    return elems;
  }
}

class EmptySquare extends Component {
  render() {
    return <td />;
  }
}

let dropTarget = {
  canDrop(props, monitor) {
    let { nx, ny, canPlay } = props, { x, y, p } = monitor.getItem();
    return true; //canPlay(x, y, nx, ny);
  },

  drop(props, monitor) {
    let { nx, ny } = props, { x, y, p } = monitor.getItem();
  }
};

@DropTarget('piece', dropTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  isOver: monitor.isOver()
}))
class Square extends Component {
  render() {
    let { x, y, p, connectDropTarget, isOver } = this.props,
        cls = classNames('playable', { dragging: isOver });
    return connectDropTarget(
      <td className={cls}>
        { p != 0 && <Piece x={x} y={y} p={p} /> }
      </td>);
  }
}

let dragSource = {
  beginDrag(props) {
    let { x, y, p } = props;
    return { x, y, p };
  }
};

@DragSource('piece', dragSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))
class Piece extends Component {
  componentDidMount() {
    let { p, connectDragPreview } = this.props, img = new Image();
    img.src = pieceImages[p];
    connectDragPreview(img);
  }

  render() {
    let { p, connectDragSource, isDragging } = this.props;
    return connectDragSource(<img src={pieceImages[p]} />);
  }
}
