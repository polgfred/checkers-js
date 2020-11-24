import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import { Game } from './ui/game';

import './main.css';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    ReactDOM.render(<Game />, document.getElementById('checkers-container'));
  },
  false
);
