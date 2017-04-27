import expect from 'expect.js';

import Rules from '../src/rules';

describe('Rules', function() {
  before(function() {
    this.rules = new Rules([
      [  0,  0,  1,  0,  0,  0,  0,  0 ],
      [  0, -1,  0, -1,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0, -1,  0, -1,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0, -1,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ],
      [  0,  0,  0,  0,  0,  0,  0,  0 ]
    ], 1)
  });

  it('should initialize the board', function() {
    expect(this.rules.board[0][0]).to.be(0);
  });

  it('should initialize the side', function() {
    expect(this.rules.side).to.be(1);
  });

  it('should find the jumps from this position', function() {
    let plays = this.rules.collectPlays();
    expect(plays.length).to.be(3);
    expect(plays).to.eql([
      [ 2, 0, 4, 2, 6, 4, 4, 6 ],
      [ 2, 0, 4, 2, 2, 4 ],
      [ 2, 0, 0, 2 ]
    ]);
  });

  it('should build a jump tree from this position', function() {
    let plays = this.rules.collectTree();
    expect(plays['2,0']['4,2']['6,4']['4,6']).to.eql({});
    expect(plays['2,0']['4,2']['2,4']).to.eql({});
    expect(plays['2,0']['0,2']).to.eql({});
  });
});
