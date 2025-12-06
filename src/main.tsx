import React from 'react';
import { createRoot } from 'react-dom/client';

import { Game } from './ui/game.js';

import './main.css';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const container = document.getElementById('checkers-container');
    const root = createRoot(container);
    root.render(<Game />);
  },
  false
);
