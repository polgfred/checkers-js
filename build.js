'use strict';

import { inspect } from 'util';

import Rules from './public/js/rules';
import Player from './public/js/player';

let board = [
  [  0, -1,  0, -1,  0, -1,  0, -1 ],
  [ -1,  0, -1,  0, -1,  0, -1,  0 ],
  [  0, -1,  0, -1,  0, -1,  0, -1 ],
  [  0,  0,  0,  0,  0,  0,  0,  0 ],
  [  0,  0,  0,  0,  0,  0,  0,  0 ],
  [  1,  0,  1,  0,  1,  0,  1,  0 ],
  [  0,  1,  0,  1,  0,  1,  0,  1 ],
  [  1,  0,  1,  0,  1,  0,  1,  0 ]
].reverse();

let p = new Player(board, 1);
console.log(inspect(p.run()));
