'use strict';

import React, { Component } from 'react';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';

import { coordsToNumber } from '../core/utils';

const pieceImages = new Map();
pieceImages.set(+1, 'src/images/red-piece.svg');
pieceImages.set(+2, 'src/images/red-king.svg');
pieceImages.set(-1, 'src/images/white-piece.svg');
pieceImages.set(-2, 'src/images/white-king.svg');

@DragDropContext(HTML5Backend)
export default class Board extends Component {
  render() {
    return <div className="board-container">
      <table className="board">
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
        { this.renderSquares(y) }
      </tr>);
    }

    return elems;
  }

  renderSquares(y) {
    let { board, canDrag, canDrop, endDrag } = this.props, elems = [];

    for (let x = 0; x <= 7; ++x) {
      let p = board[y][x], piece;

      if (p != 0) {
        piece = <Piece x={x} y={y} p={p} canDrag={canDrag} endDrag={endDrag} />;
      }

      if ((x + y) % 2 == 0) {
        elems.push(<Square key={x} x={x} y={y} p={p} canDrop={canDrop}>
          <span>{ coordsToNumber(x, y) }</span>
          { piece }
        </Square>);
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

@DropTarget('piece', {
  canDrop: (props, monitor) => props.canDrop({ x: props.x, y: props.y }, monitor.getItem()),
  drop: (props, monitor) => ({ x: props.x, y: props.y })
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  isOver: monitor.isOver()
}))
class Square extends Component {
  render() {
    let { x, y, p, connectDropTarget, canDrop, isOver } = this.props;

    return connectDropTarget(
      <td className={classNames({
            'playable': true,
            'can-drop': canDrop,
            'is-over': isOver })}>
        { this.props.children }
      </td>);
  }
}

@DragSource('piece', {
  canDrag: props => props.canDrag({ x: props.x, y: props.y }),
  beginDrag: props => ({ x: props.x, y: props.y }),
  endDrag: (props, monitor) => props.endDrag(monitor.getItem(), monitor.getDropResult())
}, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))
class Piece extends Component {
  componentDidMount() {
    let { p, connectDragPreview } = this.props, img = new Image();
    img.src = pieceImages.get(p);
    connectDragPreview(img);
  }

  render() {
    let { p, connectDragSource, isDragging } = this.props;

    return connectDragSource(
      <img src={pieceImages.get(p)} className={classNames({
                                      'is-dragging': isDragging
                                    })} />);
  }
}
