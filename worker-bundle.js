/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/core/analyzer.ts":
/*!******************************!*\
  !*** ./src/core/analyzer.ts ***!
  \******************************/
/*! namespace exports */
/*! export analyze [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "analyze": () => /* binding */ analyze
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./src/core/types.ts");
/* harmony import */ var _rules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rules */ "./src/core/rules.ts");
/* harmony import */ var _default_evaluator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./default_evaluator */ "./src/core/default_evaluator.ts");



const { RED, WHT } = _types__WEBPACK_IMPORTED_MODULE_0__.SideType;
// how many levels deep to search the tree
const LEVEL = 8;
function analyze(board, side, player = _default_evaluator__WEBPACK_IMPORTED_MODULE_2__.default) {
    // make the rules for the current position
    const { getBoard, getSide, findJumps, doJump, findMoves, doMove } = (0,_rules__WEBPACK_IMPORTED_MODULE_1__.makeRules)(board, side);
    function loop(level) {
        const board = getBoard();
        const side = getSide();
        let bestScore = side / -0;
        let bestPlay;
        let current;
        // if there are jumps from this position, keep searching
        const jumps = findJumps();
        if (jumps.length) {
            // analyze counter-jumps from this position
            for (let i = 0; i < jumps.length; ++i) {
                const jump = jumps[i];
                // perform the jump and descend a level
                const reverse = doJump(jump);
                current = loop(level - 1)[1];
                reverse();
                // keep track of the best move from this position
                if ((side === RED && current > bestScore) ||
                    (side === WHT && current < bestScore)) {
                    bestPlay = jump;
                    bestScore = current;
                }
            }
        }
        else if (level > 0) {
            // analyze counter-moves from this position
            const moves = findMoves();
            for (let i = 0; i < moves.length; ++i) {
                const move = moves[i];
                // perform the jump and descend a level
                const reverse = doMove(move);
                current = loop(level - 1)[1];
                reverse();
                // keep track of the best move from this position
                if ((side === RED && current > bestScore) ||
                    (side === WHT && current < bestScore)) {
                    bestPlay = move;
                    bestScore = current;
                }
            }
        }
        else {
            // we've hit bottom and there are no jumps, so just return
            // the score for this position
            bestScore = player.evaluate(board);
        }
        // a pair representing the winning play and score for this turn
        return [bestPlay, bestScore];
    }
    // start the descent
    return loop(LEVEL);
}


/***/ }),

/***/ "./src/core/default_evaluator.ts":
/*!***************************************!*\
  !*** ./src/core/default_evaluator.ts ***!
  \***************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _evaluator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./evaluator */ "./src/core/evaluator.ts");

const defaultEvaluator = (0,_evaluator__WEBPACK_IMPORTED_MODULE_0__.makeEvaluator)();
// basic piece values
defaultEvaluator.addFormation([[0, 0, 1]], 
// prettier-ignore
[
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 0, 50, 0, 50, 0, 50, 0],
    [0, 50, 0, 50, 0, 50, 0, 50],
    [50, 0, 50, 0, 50, 0, 50, 0],
    [0, 50, 0, 50, 0, 50, 0, 50],
    [50, 0, 50, 0, 50, 0, 50, 0],
    [0, 50, 0, 50, 0, 50, 0, 50],
    [50, 0, 50, 0, 50, 0, 50, 0],
].reverse());
// basic king values
defaultEvaluator.addFormation([[0, 0, 2]], 
// prettier-ignore
[
    [0, 60, 0, 60, 0, 60, 0, 60],
    [60, 0, 60, 0, 60, 0, 60, 0],
    [0, 60, 0, 60, 0, 60, 0, 60],
    [60, 0, 60, 0, 60, 0, 60, 0],
    [0, 60, 0, 60, 0, 60, 0, 60],
    [60, 0, 60, 0, 60, 0, 60, 0],
    [0, 60, 0, 60, 0, 60, 0, 60],
    [60, 0, 60, 0, 60, 0, 60, 0],
].reverse());
// offensive lines
defaultEvaluator.addFormation([
    [0, 0, 3],
    [1, -1, 3],
], 
// prettier-ignore
[
    [0, 12, 0, 8, 0, 0, 0, 0],
    [12, 0, 10, 0, 6, 0, 0, 0],
    [0, 10, 0, 8, 0, 4, 0, 0],
    [8, 0, 8, 0, 6, 0, 2, 0],
    [0, 6, 0, 6, 0, 4, 0, 0],
    [0, 0, 4, 0, 4, 0, 2, 0],
    [0, 0, 0, 2, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
].reverse());
// offensive 3-lines
defaultEvaluator.addFormation([
    [0, 0, 3],
    [1, -1, 3],
    [2, -2, 3],
], 
// prettier-ignore
[
    [0, 12, 0, 8, 0, 0, 0, 0],
    [12, 0, 10, 0, 6, 0, 0, 0],
    [0, 10, 0, 8, 0, 4, 0, 0],
    [8, 0, 8, 0, 6, 0, 0, 0],
    [0, 6, 0, 6, 0, 4, 0, 0],
    [0, 0, 4, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
].reverse());
// triangle bases
defaultEvaluator.addFormation([
    [0, 0, 3],
    [1, -1, 3],
    [-1, -1, 3],
], 
// prettier-ignore
[
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 12, 0, 8, 0, 4, 0],
    [0, 8, 0, 12, 0, 8, 0, 0],
    [0, 0, 8, 0, 12, 0, 8, 0],
    [0, 4, 0, 12, 0, 12, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
].reverse());
// defensive lines
defaultEvaluator.addFormation([
    [0, 0, 3],
    [-1, -1, 3],
], 
// prettier-ignore
[
    [0, 0, 0, 0, 0, 10, 0, 16],
    [0, 0, 0, 0, 8, 0, 12, 0],
    [0, 0, 0, 6, 0, 10, 0, 10],
    [0, 0, 4, 0, 8, 0, 8, 0],
    [0, 2, 0, 6, 0, 6, 0, 0],
    [0, 0, 4, 0, 4, 0, 0, 0],
    [0, 2, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
].reverse());
// defensive 3-lines
defaultEvaluator.addFormation([
    [0, 0, 3],
    [-1, -1, 3],
    [-2, -2, 3],
], 
// prettier-ignore
[
    [0, 0, 0, 0, 0, 10, 0, 16],
    [0, 0, 0, 0, 8, 0, 12, 0],
    [0, 0, 0, 6, 0, 10, 0, 10],
    [0, 0, 4, 0, 8, 0, 8, 0],
    [0, 0, 0, 6, 0, 6, 0, 0],
    [0, 0, 4, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
].reverse());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (defaultEvaluator);


/***/ }),

/***/ "./src/core/evaluator.ts":
/*!*******************************!*\
  !*** ./src/core/evaluator.ts ***!
  \*******************************/
/*! namespace exports */
/*! export makeEvaluator [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeEvaluator": () => /* binding */ makeEvaluator
/* harmony export */ });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./src/core/types.ts");

const { EMPTY, WHT_PIECE, WHT_KING, WHT_EITHER, RED_PIECE, RED_KING, RED_EITHER, } = _types__WEBPACK_IMPORTED_MODULE_0__.PieceType;
function makeEvaluator() {
    // scores are represented as a 2D array of [pattern, score] pairs, where:
    //  - `pattern` is an array of [dx, dy, value] triples, and
    //  - `score` is what will be awarded if the pattern matches
    const scores = [[], [], [], [], [], [], [], []];
    function addFormation(formation, values) {
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
        // `values` is an 8x8 array of values representing the bonus (or penalty)
        //    awarded when the formation's origin matches the given position
        // push on the pattern and score for each non-zero slot
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                const value = values[y][x];
                if (value !== 0) {
                    scores[y][x] = scores[y][x] || [];
                    scores[y][x].push([formation, value]);
                }
            }
        }
    }
    function evaluate(board) {
        // match the board and side against the formations and return a score:
        //  - for each square on the board, get the set of formations on it
        //  - for each formation, see if it applies to red (+) from the top of
        //      the board, or white (-) from the bottom, and adjust the total
        //      score accordingly
        let total = 0;
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                const r = scores[y][x];
                if (r) {
                    for (let j = 0; j < r.length; ++j) {
                        const [formation, score] = r[j];
                        let match;
                        // try the pattern as red
                        match = true;
                        for (let k = 0; k < formation.length; ++k) {
                            const [dx, dy, v] = formation[k];
                            const p = board[y + dy][x + dx];
                            // see if the formation matches for this square
                            if (!((v === EMPTY && p === EMPTY) ||
                                ((v === RED_PIECE || v === RED_EITHER) && p === RED_PIECE) ||
                                ((v === RED_KING || v === RED_EITHER) && p === RED_KING) ||
                                ((v === WHT_PIECE || v === WHT_EITHER) && p === WHT_PIECE) ||
                                ((v === WHT_KING || v === WHT_EITHER) && p === WHT_KING))) {
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
                        for (let k = 0; k < formation.length; ++k) {
                            const [dx, dy, v] = formation[k];
                            const p = board[(y ^ 7) - dy][(x ^ 7) - dx];
                            // see if the pattern matches for this square
                            if (!((v === EMPTY && p === EMPTY) ||
                                ((v === RED_PIECE || v === RED_EITHER) && p === WHT_PIECE) ||
                                ((v === RED_KING || v === RED_EITHER) && p === WHT_KING) ||
                                ((v === WHT_PIECE || v === WHT_EITHER) && p === RED_PIECE) ||
                                ((v === WHT_KING || v === WHT_EITHER) && p === RED_KING))) {
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
    return {
        getScores: () => scores,
        addFormation,
        evaluate,
    };
}


/***/ }),

/***/ "./src/core/rules.ts":
/*!***************************!*\
  !*** ./src/core/rules.ts ***!
  \***************************/
/*! namespace exports */
/*! export makeRules [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeRules": () => /* binding */ makeRules
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/core/utils.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./types */ "./src/core/types.ts");


const { RED } = _types__WEBPACK_IMPORTED_MODULE_1__.SideType;
const { EMPTY } = _types__WEBPACK_IMPORTED_MODULE_1__.PieceType;
function makeRules(_board, side) {
    // don't mutate the caller's board
    const board = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.copyBoard)(_board);
    function findJumps() {
        const top = side === RED ? 7 : 0;
        const out = top + side;
        const bottom = top ^ 7;
        const jumps = [];
        // loop through playable squares
        for (let y = bottom; y !== out; y += side) {
            for (let x = bottom; x !== out; x += side) {
                // see if it's our piece
                const p = board[y][x];
                if (side === RED ? p > 0 : p < 0) {
                    // checking for jumps is inherently recursive - as long as you find them,
                    // you have to keep looking, and only termimal positions are valid
                    nextJump([[x, y]], jumps);
                }
            }
        }
        return jumps;
    }
    function nextJump(cur, jumps) {
        const [x, y] = cur[cur.length - 1];
        const p = board[y][x];
        const top = side === RED ? 7 : 0;
        const king = (0,_types__WEBPACK_IMPORTED_MODULE_1__.isKingOf)(side, p);
        let found = false;
        // loop over directions (dx, dy) from the current square
        for (let dy = king ? -1 : 1; dy <= 1; dy += 2) {
            for (let dx = -1; dx <= 1; dx += 2) {
                let mx;
                let my;
                let nx;
                let ny;
                // calculate middle and landing coordinates
                if (side === 1) {
                    mx = x + dx;
                    my = y + dy;
                    nx = mx + dx;
                    ny = my + dy;
                }
                else {
                    mx = x - dx;
                    my = y - dy;
                    nx = mx - dx;
                    ny = my - dy;
                }
                // see if jump is on the board
                if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                    const m = board[my][mx];
                    const n = board[ny][nx];
                    // see if the middle piece is an opponent and the landing is open
                    if (n === EMPTY && (side === RED ? m < 0 : m > 0)) {
                        const crowned = !king && ny === top;
                        found = true;
                        // keep track of the coordinates, and move the piece
                        board[y][x] = EMPTY;
                        board[my][mx] = EMPTY;
                        board[ny][nx] = crowned ? p << 1 : p;
                        // if we're crowned, or there are no further jumps from here,
                        // we've reached a terminal position
                        cur.push([nx, ny, mx, my]);
                        if (crowned || !nextJump(cur, jumps)) {
                            jumps.push(cur.slice());
                        }
                        // put things back where we found them
                        cur.pop();
                        board[y][x] = p;
                        board[my][mx] = m;
                        board[ny][nx] = EMPTY;
                    }
                }
            }
        }
        // return whether more jumps were found from this position
        return found;
    }
    function doJump(jump) {
        const len = jump.length;
        const [x, y] = jump[0];
        const [fx, fy] = jump[len - 1];
        const p = board[y][x];
        const top = side === RED ? 7 : 0;
        const crowned = (0,_types__WEBPACK_IMPORTED_MODULE_1__.isPieceOf)(side, p) && fy === top;
        const cap = new Array(len);
        // remove the initial piece
        cap[0] = p;
        board[y][x] = EMPTY;
        // loop over the passed in coords
        for (let i = 1; i < len; ++i) {
            const [, , mx, my] = jump[i];
            // perform the jump
            cap[i] = board[my][mx];
            board[my][mx] = EMPTY;
        }
        // final piece
        board[fy][fx] = crowned ? p << 1 : p;
        // switch sides
        side = -side;
        // reverse the jump
        return () => {
            // remove the final piece
            board[fy][fx] = EMPTY;
            // loop over the passed in coords in reverse
            for (let i = len - 1; i > 0; --i) {
                const [, , mx, my] = jump[i];
                // put back the captured piece
                board[my][mx] = cap[i];
            }
            // put back initial piece
            board[y][x] = p;
            // switch back to original side
            side = -side;
        };
    }
    function findMoves() {
        const top = side === RED ? 7 : 0;
        const out = top + side;
        const bottom = top ^ 7;
        const moves = [];
        // loop through playable squares
        for (let y = bottom; y !== out; y += side) {
            for (let x = bottom; x !== out; x += side) {
                const p = board[y][x];
                const king = (0,_types__WEBPACK_IMPORTED_MODULE_1__.isKingOf)(side, p);
                // see if it's our piece
                if (side === RED ? p > 0 : p < 0) {
                    // loop over directions (dx, dy) from the current square
                    for (let dy = king ? -1 : 1; dy <= 1; dy += 2) {
                        for (let dx = -1; dx <= 1; dx += 2) {
                            let nx;
                            let ny;
                            // calculate landing coordinates
                            if (side === RED) {
                                nx = x + dx;
                                ny = y + dy;
                            }
                            else {
                                nx = x - dx;
                                ny = y - dy;
                            }
                            // see if move is on the board
                            if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                                // see if the landing is open
                                if (board[ny][nx] === EMPTY) {
                                    moves.push([
                                        [x, y],
                                        [nx, ny],
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
    function doMove(move) {
        const [[x, y], [nx, ny]] = move;
        const p = board[y][x];
        const top = side === RED ? 7 : 0;
        const crowned = (0,_types__WEBPACK_IMPORTED_MODULE_1__.isPieceOf)(side, p) && ny === top;
        // perform the jump
        board[y][x] = EMPTY;
        board[ny][nx] = crowned ? p << 1 : p;
        // switch sides
        side = -side;
        // reverse the move
        return () => {
            // put things back where we found them
            board[ny][nx] = EMPTY;
            board[y][x] = p;
            // switch back
            side = -side;
        };
    }
    function findPlays() {
        // you have to jump if you can
        const jumps = findJumps();
        if (jumps.length) {
            return jumps;
        }
        else {
            return findMoves();
        }
    }
    function doPlay(play) {
        // if the second segment has coords for the jumped piece,
        // it has to be a jump
        if (play[1].length > 2) {
            return doJump(play);
        }
        else {
            return doMove(play);
        }
    }
    function buildTree() {
        const plays = findPlays();
        const tree = {};
        for (let i = 0; i < plays.length; ++i) {
            const play = plays[i];
            let root = tree;
            for (let j = 0; j < play.length; ++j) {
                const [x, y] = play[j];
                const k = `${x},${y}`;
                root[k] = root[k] || {};
                root = root[k];
            }
        }
        return tree;
    }
    return {
        getBoard: () => board,
        getSide: () => side,
        findJumps,
        findMoves,
        findPlays,
        doJump,
        doMove,
        doPlay,
        buildTree,
    };
}


/***/ }),

/***/ "./src/core/types.ts":
/*!***************************!*\
  !*** ./src/core/types.ts ***!
  \***************************/
/*! namespace exports */
/*! export PieceType [provided] [no usage info] [missing usage info prevents renaming] */
/*! export SideType [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isKingOf [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isPieceOf [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SideType": () => /* binding */ SideType,
/* harmony export */   "PieceType": () => /* binding */ PieceType,
/* harmony export */   "isPieceOf": () => /* binding */ isPieceOf,
/* harmony export */   "isKingOf": () => /* binding */ isKingOf
/* harmony export */ });
var SideType;
(function (SideType) {
    SideType[SideType["RED"] = 1] = "RED";
    SideType[SideType["WHT"] = -1] = "WHT";
})(SideType || (SideType = {}));
var PieceType;
(function (PieceType) {
    PieceType[PieceType["EMPTY"] = 0] = "EMPTY";
    PieceType[PieceType["RED_PIECE"] = 1] = "RED_PIECE";
    PieceType[PieceType["RED_KING"] = 2] = "RED_KING";
    PieceType[PieceType["RED_EITHER"] = 3] = "RED_EITHER";
    PieceType[PieceType["WHT_PIECE"] = -1] = "WHT_PIECE";
    PieceType[PieceType["WHT_KING"] = -2] = "WHT_KING";
    PieceType[PieceType["WHT_EITHER"] = -3] = "WHT_EITHER";
})(PieceType || (PieceType = {}));
function isPieceOf(side, piece) {
    return ((side === SideType.RED && piece === PieceType.RED_PIECE) ||
        (side === SideType.WHT && piece === PieceType.WHT_PIECE));
}
function isKingOf(side, piece) {
    return ((side === SideType.RED && piece === PieceType.RED_KING) ||
        (side === SideType.WHT && piece === PieceType.WHT_KING));
}


/***/ }),

/***/ "./src/core/utils.ts":
/*!***************************!*\
  !*** ./src/core/utils.ts ***!
  \***************************/
/*! namespace exports */
/*! export as2DArray [provided] [no usage info] [missing usage info prevents renaming] */
/*! export coordsToNumber [provided] [no usage info] [missing usage info prevents renaming] */
/*! export copyBoard [provided] [no usage info] [missing usage info prevents renaming] */
/*! export moveToString [provided] [no usage info] [missing usage info prevents renaming] */
/*! export newBoard [provided] [no usage info] [missing usage info prevents renaming] */
/*! export newBoardFromData [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "newBoard": () => /* binding */ newBoard,
/* harmony export */   "copyBoard": () => /* binding */ copyBoard,
/* harmony export */   "newBoardFromData": () => /* binding */ newBoardFromData,
/* harmony export */   "as2DArray": () => /* binding */ as2DArray,
/* harmony export */   "coordsToNumber": () => /* binding */ coordsToNumber,
/* harmony export */   "moveToString": () => /* binding */ moveToString
/* harmony export */ });
// set up the initial board position
const initial = as2DArray(new ArrayBuffer(64));
initial[0][0] = initial[0][2] = initial[0][4] = initial[0][6] = 1;
initial[1][1] = initial[1][3] = initial[1][5] = initial[1][7] = 1;
initial[2][0] = initial[2][2] = initial[2][4] = initial[2][6] = 1;
initial[5][1] = initial[5][3] = initial[5][5] = initial[5][7] = -1;
initial[6][0] = initial[6][2] = initial[6][4] = initial[6][6] = -1;
initial[7][1] = initial[7][3] = initial[7][5] = initial[7][7] = -1;
// make a copy of the initial board position
function newBoard() {
    return copyBoard(initial);
}
// only use this on boards that are backed by a shared buffer!
function copyBoard(board) {
    return as2DArray(board[0].buffer.slice(0));
}
// make a new board from the passed in array data
function newBoardFromData(data) {
    const board = as2DArray(new ArrayBuffer(64));
    for (let i = 0; i < 8; ++i) {
        board[i].set(data[i]);
    }
    return board;
}
// make a 2d array wrapper around a 64-byte buffer
function as2DArray(buf) {
    return [
        new Int8Array(buf, 0, 8),
        new Int8Array(buf, 8, 8),
        new Int8Array(buf, 16, 8),
        new Int8Array(buf, 24, 8),
        new Int8Array(buf, 32, 8),
        new Int8Array(buf, 40, 8),
        new Int8Array(buf, 48, 8),
        new Int8Array(buf, 56, 8),
    ];
}
function coordsToNumber(x, y) {
    return ((y + 1) << 2) - (x >> 1);
}
function moveToString(move) {
    if (move) {
        const [x, y] = move[0];
        let str = String(coordsToNumber(x, y));
        for (let i = 1; i < move.length; ++i) {
            const [nx, ny] = move[i];
            str += move[i].length > 2 ? ' x ' : ' - ';
            str += coordsToNumber(nx, ny);
        }
        return str;
    }
}


/***/ }),

/***/ "./src/worker.ts":
/*!***********************!*\
  !*** ./src/worker.ts ***!
  \***********************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_analyzer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/analyzer */ "./src/core/analyzer.ts");

self.addEventListener('message', (ev) => {
    const { board, side } = ev.data;
    const [move] = (0,_core_analyzer__WEBPACK_IMPORTED_MODULE_0__.analyze)(board, side);
    self.postMessage({ move });
}, false);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/worker.ts");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=worker-bundle.js.map