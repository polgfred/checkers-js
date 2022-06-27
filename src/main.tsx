import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { Game } from './ui/game';

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
