import expect from 'expect.js';

import Analyzer from '../src/analyzer';

describe('Analyzer', function() {
  before(function() {
    this.analyzer = new Analyzer([
      new Int8Array([  0,  0,  0,  0,  0,  0,  0,  0 ]),
      new Int8Array([  0,  0,  0,  0,  0,  0,  0,  0 ]),
      new Int8Array([  0,  0,  0,  0,  0, -1,  0,  0 ]),
      new Int8Array([  0,  0,  0,  0,  0,  0,  0,  0 ]),
      new Int8Array([  0,  0,  0, -1,  0, -1,  0,  0 ]),
      new Int8Array([  0,  0,  0,  0,  0,  0,  0,  0 ]),
      new Int8Array([  0, -1,  0, -1,  0,  0,  0,  0 ]),
      new Int8Array([  0,  0,  1,  0,  0,  0,  0,  0 ])
    ].reverse(), 1);
  });

  it('should initialize the player', function() {
    expect(this.analyzer.board[0][0]).to.be(0);
  });

  it('should initialize the side', function() {
    expect(this.analyzer.side).to.be(1);
  });

  it('should initialize the level', function() {
    expect(this.analyzer.level).to.be(6);
  });

  describe('#run', function() {
    before(function() {
      this.play = this.analyzer.run();
    });

    it('should find the best play from this position', function() {
      expect(this.play[0]).to.eql([ 2, 0, 4, 2, 6, 4, 4, 6 ]);
    });

    it('should find the best score from this position', function() {
      expect(this.play[1]).to.be(-68);
    });
  });
});
