import expect from 'expect.js';

import Rules from '../src/core/rules';
import { newBoard, newBoardFromData } from '../src/core/utils';

describe('moves', function() {
  before(function() {
    let board = newBoard();

    this.rules = new Rules(board, +1);
  });

  it('should initialize the board', function() {
    expect(this.rules.board[0][0]).to.be(+1);
  });

  it('should initialize the side', function() {
    expect(this.rules.side).to.be(+1);
  });

  it('should find the moves from this position', function() {
    let plays;
    console.time('moves');
    for (let i = 1000; i; --i) {
      plays = this.rules.moves();
    }
    console.timeEnd('moves');

    expect(plays.length).to.be(7);
    expect(plays).to.eql([
      [ 0, 2, 1, 3 ],
      [ 2, 2, 1, 3 ],
      [ 2, 2, 3, 3 ],
      [ 4, 2, 3, 3 ],
      [ 4, 2, 5, 3 ],
      [ 6, 2, 5, 3 ],
      [ 6, 2, 7, 3 ]
    ]);
  });
});

describe('jumps', function() {
  before(function() {
    let board = newBoardFromData([
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0, -1,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0, -1,  0, -1,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0, -1,  0, -1,  0,  0,  0,  0 ],
      [  0,  0,  1,  0,  0,  0,  0,  0 ]
    ].reverse());

    this.rules = new Rules(board, +1);
  });

  it('should initialize the board', function() {
    expect(this.rules.board[0][0]).to.be(0);
  });

  it('should initialize the side', function() {
    expect(this.rules.side).to.be(+1);
  });

  it('should find the jumps from this position', function() {
    let plays;
    console.time('jumps');
    for (let i = 1000; i; --i) {
      plays = this.rules.jumps();
    }
    console.timeEnd('jumps');

    expect(plays.length).to.be(3);
    expect(plays).to.eql([
      [ 2, 0, 0, 2 ],
      [ 2, 0, 4, 2, 2, 4 ],
      [ 2, 0, 4, 2, 6, 4, 4, 6 ],
    ]);
  });

  xit('should build a jump tree from this position', function() {
    let plays = this.rules.collectTree();
    expect(plays['2,0']['4,2']['6,4']['4,6']).to.eql({});
    expect(plays['2,0']['4,2']['2,4']).to.eql({});
    expect(plays['2,0']['0,2']).to.eql({});
  });
});
