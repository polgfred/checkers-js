import expect from 'expect.js';

import { inspect } from 'util';

import Rules from '../src/core/rules';
import Analyzer, { Evaluator } from '../src/core/analyzer';
import { newBoard, newBoardFromData } from '../src/core/utils';

describe('moves', function() {
  before(function() {
    let board = newBoard();

    this.rules = new Rules(board, +1);
  });

  it('should find the moves from this position', function() {
    let plays;
    console.time('moves');
    for (let i = 1000; i; --i) {
      plays = this.rules.findMoves();
    }
    console.timeEnd('moves');

    expect(plays.length).to.be(7);
    expect(plays).to.eql([
      [ [0, 2], [1, 3] ],
      [ [2, 2], [1, 3] ],
      [ [2, 2], [3, 3] ],
      [ [4, 2], [3, 3] ],
      [ [4, 2], [5, 3] ],
      [ [6, 2], [5, 3] ],
      [ [6, 2], [7, 3] ]
    ]);
  });

  it('should find the jumps from this position', function() {
    let plays;
    console.time('jumps');
    for (let i = 1000; i; --i) {
      plays = this.rules.findJumps();
    }
    console.timeEnd('jumps');

    expect(plays.length).to.be(0);
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

  it('should find the jumps from this position', function() {
    let plays;
    console.time('jumps');
    for (let i = 1000; i; --i) {
      plays = this.rules.findJumps();
    }
    console.timeEnd('jumps');

    expect(plays.length).to.be(3);
    expect(plays).to.eql([
      [ [2, 0], [0, 2, 1, 1] ],
      [ [2, 0], [4, 2, 3, 1], [2, 4, 3, 3] ],
      [ [2, 0], [4, 2, 3, 1], [6, 4, 5, 3], [4, 6, 5, 5] ]
    ]);
  });
});
