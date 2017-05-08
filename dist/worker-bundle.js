/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 269);
/******/ })
/************************************************************************/
/******/ ({

/***/ 112:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rules = function () {
  function Rules(board, side) {
    _classCallCheck(this, Rules);

    this.board = board;
    this.side = side;
  }

  _createClass(Rules, [{
    key: 'findJumps',
    value: function findJumps() {
      var board = this.board,
          side = this.side,
          top = side == 1 ? 7 : 0,
          out = top + side,
          bottom = top ^ 7,
          jumps = [];

      // loop through playable squares

      for (var y = bottom; y != out; y += side) {
        for (var x = bottom; x != out; x += side) {
          // see if it's our piece
          var p = board[y][x];

          if (side * p > 0) {
            // checking for jumps is inherently recursive - as long as you find them,
            // you have to keep looking, and only termimal positions are valid
            this.nextJump([[x, y]], jumps);
          }
        }
      }

      return jumps;
    }
  }, {
    key: 'nextJump',
    value: function nextJump(cur, jumps) {
      var board = this.board,
          side = this.side,
          _cur = _slicedToArray(cur[cur.length - 1], 2),
          x = _cur[0],
          y = _cur[1],
          p = board[y][x],
          top = side == 1 ? 7 : 0,
          king = p == side * 2,
          found = false;

      // loop over directions (dx, dy) from the current square


      for (var dy = king ? -1 : 1; dy != 3; dy += 2) {
        for (var dx = -1; dx != 3; dx += 2) {
          var mx = void 0,
              my = void 0,
              nx = void 0,
              ny = void 0;

          // calculate middle and landing coordinates
          if (side == 1) {
            mx = x + dx;
            my = y + dy;
            nx = mx + dx;
            ny = my + dy;
          } else {
            mx = x - dx;
            my = y - dy;
            nx = mx - dx;
            ny = my - dy;
          }

          // see if jump is on the board
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
            var m = board[my][mx],
                n = board[ny][nx];

            // see if the middle piece is an opponent and the landing is open
            if (n == 0 && side * m < 0) {
              var crowned = !king && ny == top;
              found = true;

              // keep track of the coordinates, and move the piece
              board[y][x] = 0;
              board[my][mx] = 0;
              board[ny][nx] = crowned ? p * 2 : p;

              // if we're crowned, or there are no further jumps from here,
              // we've reached a terminal position
              cur.push([nx, ny, mx, my]);
              if (crowned || !this.nextJump(cur, jumps)) {
                jumps.push(cur.slice());
              }

              // put things back where we found them
              cur.pop();
              board[y][x] = p;
              board[my][mx] = m;
              board[ny][nx] = 0;
            }
          }
        }
      }

      // return whether more jumps were found from this position
      return found;
    }
  }, {
    key: 'withJump',
    value: function withJump(jump, action) {
      var board = this.board,
          side = this.side,
          len = jump.length,
          _jump$ = _slicedToArray(jump[0], 2),
          x = _jump$[0],
          y = _jump$[1],
          _jump = _slicedToArray(jump[len - 1], 2),
          fx = _jump[0],
          fy = _jump[1],
          p = board[y][x],
          top = side == 1 ? 7 : 0,
          crowned = p == side && fy == top,
          cap = new Array(len);

      // remove the initial piece


      cap[0] = p;
      board[y][x] = 0;

      // loop over the passed in coords
      for (var i = 1; i < len; ++i) {
        var _jump$i = _slicedToArray(jump[i], 4),
            mx = _jump$i[2],
            my = _jump$i[3];

        // perform the jump


        cap[i] = board[my][mx];
        board[my][mx] = 0;
      }

      // final piece
      board[fy][fx] = crowned ? p * 2 : p;

      // do the action
      action();

      // remove the final piece
      board[fy][fx] = 0;

      // loop over the passed in coords in reverse
      for (var _i = len - 1; _i > 0; --_i) {
        var _jump$_i = _slicedToArray(jump[_i], 4),
            mx = _jump$_i[2],
            my = _jump$_i[3];

        // put back the captured piece


        board[my][mx] = cap[_i];
      }

      // put back initial piece
      board[y][x] = p;
    }
  }, {
    key: 'findMoves',
    value: function findMoves() {
      var board = this.board,
          side = this.side,
          top = side == 1 ? 7 : 0,
          out = top + side,
          bottom = top ^ 7,
          moves = [];

      // loop through playable squares

      for (var y = bottom; y != out; y += side) {
        for (var x = bottom; x != out; x += side) {
          var p = board[y][x],
              king = p == side * 2;

          // see if it's our piece
          if (side * p > 0) {
            // loop over directions (dx, dy) from the current square
            for (var dy = king ? -1 : 1; dy != 3; dy += 2) {
              for (var dx = -1; dx != 3; dx += 2) {
                var nx = void 0,
                    ny = void 0;

                // calculate landing coordinates
                if (side == 1) {
                  nx = x + dx;
                  ny = y + dy;
                } else {
                  nx = x - dx;
                  ny = y - dy;
                }

                // see if move is on the board
                if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                  var crowned = !king && ny == top;

                  // see if the landing is open
                  if (board[ny][nx] == 0) {
                    // keep track of the coordinates, and move the piece
                    board[y][x] = 0;
                    board[ny][nx] = crowned ? p * 2 : p;

                    moves.push([[x, y], [nx, ny]]);

                    // put things back where we found them
                    board[y][x] = p;
                    board[ny][nx] = 0;
                  }
                }
              }
            }
          }
        }
      }

      return moves;
    }
  }, {
    key: 'withMove',
    value: function withMove(move, action) {
      var board = this.board,
          side = this.side,
          _move = _slicedToArray(move, 2),
          _move$ = _slicedToArray(_move[0], 2),
          x = _move$[0],
          y = _move$[1],
          _move$2 = _slicedToArray(_move[1], 2),
          nx = _move$2[0],
          ny = _move$2[1],
          p = board[y][x],
          top = side == 1 ? 7 : 0,
          crowned = p == side && ny == top;

      // perform the jump


      board[y][x] = 0;
      board[ny][nx] = crowned ? p * 2 : p;

      // do the action
      action();

      // put things back where we found them
      board[ny][nx] = 0;
      board[y][x] = p;
    }
  }, {
    key: 'findPlays',
    value: function findPlays(block) {
      var jumps = this.findJumps();

      // you have to jump if you can
      if (jumps.length) {
        return jumps;
      } else {
        return this.findMoves();
      }
    }
  }, {
    key: 'buildTree',
    value: function buildTree() {
      var plays = this.findPlays(),
          tree = {};

      for (var i = 0; i < plays.length; ++i) {
        var play = plays[i],
            root = tree;

        for (var j = 0; j < play.length; ++j) {
          var _play$j = _slicedToArray(play[j], 2),
              x = _play$j[0],
              y = _play$j[1],
              k = x + ',' + y;

          root[k] = root[k] || {};
          root = root[k];
        }
      }

      return tree;
    }
  }]);

  return Rules;
}();

exports.default = Rules;

/***/ }),

/***/ 257:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _rules = __webpack_require__(112);

var _rules2 = _interopRequireDefault(_rules);

var _default_evaluator = __webpack_require__(263);

var _default_evaluator2 = _interopRequireDefault(_default_evaluator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Analyzer = function (_Rules) {
  _inherits(Analyzer, _Rules);

  function Analyzer(board, side) {
    _classCallCheck(this, Analyzer);

    // use default evaluator for both sides (but feel free to change it)
    var _this = _possibleConstructorReturn(this, (Analyzer.__proto__ || Object.getPrototypeOf(Analyzer)).call(this, board, side));

    _this.redEval = _this.whiteEval = _default_evaluator2.default;

    // how many levels deep to search the tree
    _this.level = 8;
    return _this;
  }

  _createClass(Analyzer, [{
    key: 'evaluate',
    value: function evaluate() {
      // delegate to the current player's evaluator
      var playerEval = this.side == 1 ? this.redEval : this.whiteEval;

      return playerEval.evaluate(this.board);
    }
  }, {
    key: 'run',
    value: function run() {
      // keep track of the current player's evaluator when switching sides
      var player = this.side == 1 ? this.redEval : this.whiteEval;

      // start at the top level
      return this.loop(this.level, player);
    }
  }, {
    key: 'loop',
    value: function loop(level, player) {
      var _this2 = this;

      var board = this.board,
          side = this.side,
          bestScore = -side * Infinity,
          bestPlay = void 0,
          current = void 0;

      // always try to find counter-jumps from this position

      var jumps = this.findJumps();

      if (jumps.length) {
        for (var i = 0; i < jumps.length; ++i) {
          var jump = jumps[i];

          this.withJump(jump, function () {
            // switch sides and descend a level
            _this2.side = -side;
            current = _this2.loop(level - 1, player)[1];
            _this2.side = side;
          });

          // keep track of the best move from this position
          if (side == +1 && current > bestScore || side == -1 && current < bestScore) {
            bestPlay = jump;
            bestScore = current;
          }
        }
      } else {
        current = player.evaluate(board);

        // see if we've hit bottom
        if (level <= 0) {
          // return score for this position
          bestScore = current;
        } else {
          // find counter-moves from this position
          var moves = this.findMoves();

          for (var _i = 0; _i < moves.length; ++_i) {
            var move = moves[_i];

            this.withMove(move, function () {
              // switch sides and descend a level
              _this2.side = -side;
              current = _this2.loop(level - 1, player)[1];
              _this2.side = side;
            });

            // keep track of the best move from this position
            if (side == +1 && current > bestScore || side == -1 && current < bestScore) {
              bestPlay = move;
              bestScore = current;
            }
          }
        }
      }

      // a pair representing the winning play and score for this turn
      return [bestPlay, bestScore];
    }
  }]);

  return Analyzer;
}(_rules2.default);

exports.default = Analyzer;

/***/ }),

/***/ 263:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _evaluator = __webpack_require__(264);

var _evaluator2 = _interopRequireDefault(_evaluator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultEvaluator = new _evaluator2.default();

// basic piece values
defaultEvaluator.addFormation([[0, 0, +1]], [[0, 0, 0, 0, 0, 0, 0, 0], [50, 0, 50, 0, 50, 0, 50, 0], [0, 50, 0, 50, 0, 50, 0, 50], [50, 0, 50, 0, 50, 0, 50, 0], [0, 50, 0, 50, 0, 50, 0, 50], [50, 0, 50, 0, 50, 0, 50, 0], [0, 50, 0, 50, 0, 50, 0, 50], [50, 0, 50, 0, 50, 0, 50, 0]].reverse());

// basic king values
defaultEvaluator.addFormation([[0, 0, +2]], [[0, 60, 0, 60, 0, 60, 0, 60], [60, 0, 60, 0, 60, 0, 60, 0], [0, 60, 0, 60, 0, 60, 0, 60], [60, 0, 60, 0, 60, 0, 60, 0], [0, 60, 0, 60, 0, 60, 0, 60], [60, 0, 60, 0, 60, 0, 60, 0], [0, 60, 0, 60, 0, 60, 0, 60], [60, 0, 60, 0, 60, 0, 60, 0]].reverse());

// offensive lines
defaultEvaluator.addFormation([[0, 0, +3], [+1, -1, +3]], [[0, 12, 0, 8, 0, 0, 0, 0], [12, 0, 10, 0, 6, 0, 0, 0], [0, 10, 0, 8, 0, 4, 0, 0], [8, 0, 8, 0, 6, 0, 2, 0], [0, 6, 0, 6, 0, 4, 0, 0], [0, 0, 4, 0, 4, 0, 2, 0], [0, 0, 0, 2, 0, 2, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]].reverse());

// offensive 3-lines
defaultEvaluator.addFormation([[0, 0, +3], [+1, -1, +3], [+2, -2, +3]], [[0, 12, 0, 8, 0, 0, 0, 0], [12, 0, 10, 0, 6, 0, 0, 0], [0, 10, 0, 8, 0, 4, 0, 0], [8, 0, 8, 0, 6, 0, 0, 0], [0, 6, 0, 6, 0, 4, 0, 0], [0, 0, 4, 0, 4, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]].reverse());

// triangle bases
defaultEvaluator.addFormation([[0, 0, +3], [+1, -1, +3], [-1, -1, +3]], [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 12, 0, 8, 0, 4, 0], [0, 8, 0, 12, 0, 8, 0, 0], [0, 0, 8, 0, 12, 0, 8, 0], [0, 4, 0, 12, 0, 12, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]].reverse());

// defensive lines
defaultEvaluator.addFormation([[0, 0, +3], [-1, -1, +3]], [[0, 0, 0, 0, 0, 10, 0, 16], [0, 0, 0, 0, 8, 0, 12, 0], [0, 0, 0, 6, 0, 10, 0, 10], [0, 0, 4, 0, 8, 0, 8, 0], [0, 2, 0, 6, 0, 6, 0, 0], [0, 0, 4, 0, 4, 0, 0, 0], [0, 2, 0, 2, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]].reverse());

// defensive 3-lines
defaultEvaluator.addFormation([[0, 0, +3], [-1, -1, +3], [-2, -2, +3]], [[0, 0, 0, 0, 0, 10, 0, 16], [0, 0, 0, 0, 8, 0, 12, 0], [0, 0, 0, 6, 0, 10, 0, 10], [0, 0, 4, 0, 8, 0, 8, 0], [0, 0, 0, 6, 0, 6, 0, 0], [0, 0, 4, 0, 4, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]].reverse());

exports.default = defaultEvaluator;

/***/ }),

/***/ 264:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Evaluator = function () {
  function Evaluator() {
    _classCallCheck(this, Evaluator);

    // rules are represented as a 2D array of [pattern, score] pairs, where:
    //  - `pattern` is an array of [dx, dy, value] pairs, and
    //  - `score` is what will be awarded if the pattern matches
    this.rules = [[], [], [], [], [], [], [], []];
  }

  _createClass(Evaluator, [{
    key: 'addFormation',
    value: function addFormation(formation, scores) {
      // `formation` takes the form [[dx, dy, v], [dx, dy, v], ...], where:
      //  - (dx, dy) is the offset from the origin of the formation, and
      //  - v is the value to match against:
      //    -  0: an empty square
      //    - +1: a regular piece on my side
      //    - +2: a king on my side
      //    - +3: any piece on my side
      //    - -1: a regular piece on my opponent's side
      //    - -2: a king on my opponent's side
      //    - -3: any piece on my opponent's side
      // `scores` is an 8x8 array of values representing the bonus (or penalty)
      //    awarded when the formation's origin matches the given position
      var rules = this.rules;

      // push on the pattern and score for each non-zero slot
      for (var y = 0; y < 8; ++y) {
        for (var x = 0; x < 8; ++x) {
          var score = scores[y][x];

          if (score != 0) {
            rules[y][x] = rules[y][x] || [];
            rules[y][x].push([formation, score]);
          }
        }
      }
    }
  }, {
    key: 'evaluate',
    value: function evaluate(board) {
      // match the board and side against the formations and return a score:
      //  - for each square on the board, get the set of formations on it
      //  - for each formation, see if it applies to red (+) from the top of
      //      the board, or white (-) from the bottom, and adjust the total
      //      score accordingly
      var rules = this.rules,
          total = 0;


      for (var y = 0; y < 8; ++y) {
        for (var x = 0; x < 8; ++x) {
          var r = rules[y][x];

          if (r) {
            for (var j = 0; j < r.length; ++j) {
              var _r$j = _slicedToArray(r[j], 2),
                  formation = _r$j[0],
                  score = _r$j[1],
                  match = void 0;

              // try the pattern as red


              match = true;
              for (var k = 0; k < formation.length; ++k) {
                var _formation$k = _slicedToArray(formation[k], 3),
                    dx = _formation$k[0],
                    dy = _formation$k[1],
                    v = _formation$k[2],
                    p = board[y + dy][x + dx];

                // see if the formation matches for this square


                if (!(v == 0 && p == 0 || (v == +1 || v == +3) && p == +1 || (v == +2 || v == +3) && p == +2 || (v == -1 || v == -3) && p == -1 || (v == -2 || v == -3) && p == -2)) {
                  // bail out and flag as failed
                  match = false;
                  break;
                }
              }
              if (match) {
                total += score;
              }

              // try the pattern as white
              match = true;
              for (var _k = 0; _k < formation.length; ++_k) {
                var _formation$_k = _slicedToArray(formation[_k], 3),
                    dx = _formation$_k[0],
                    dy = _formation$_k[1],
                    v = _formation$_k[2],
                    p = board[(y ^ 7) - dy][(x ^ 7) - dx];

                // see if the pattern matches for this square


                if (!(v == 0 && p == 0 || (v == +1 || v == +3) && p == -1 || (v == +2 || v == +3) && p == -2 || (v == -1 || v == -3) && p == +1 || (v == -2 || v == -3) && p == +2)) {
                  // bail out and flag as failed
                  match = false;
                  break;
                }
              }
              if (match) {
                total -= score;
              }
            }
          }
        }
      }

      return total;
    }
  }]);

  return Evaluator;
}();

exports.default = Evaluator;

/***/ }),

/***/ 269:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _analyzer = __webpack_require__(257);

var _analyzer2 = _interopRequireDefault(_analyzer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

addEventListener('message', function (ev) {
  var _ev$data = ev.data,
      board = _ev$data.board,
      side = _ev$data.side,
      analyzer = new _analyzer2.default(board, side);

  postMessage({ move: analyzer.run()[0] });
}, false);

/***/ })

/******/ });
//# sourceMappingURL=worker-bundle.js.map