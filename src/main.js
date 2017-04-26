'use strict';

import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import Game from './ui/game';

import './main.scss';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Game />, document.getElementById('checkers-container'));
}, false);
