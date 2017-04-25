import React from 'react';
import ReactDOM from 'react-dom';

import Board from './ui/board';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Board />, document.getElementById('checkers-container'));
}, false);
