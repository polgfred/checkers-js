import React, { useCallback, useState } from 'react';

import { newBoard } from '../core/utils';

import Board from './board';
import History from './history';
import UIPlayer from './ui_player';
import AIPlayer from './ai_player';

export default function Game() {
  const [{ board, side, hist }, setState] = useState({
    board: newBoard(),
    side: 1,
    hist: [],
  });

  const moveComplete = useCallback((board, move) => {
    return new Promise(resolve => {
      hist.push(move);
      setState({ board, side: -side, hist }, resolve);
    });
  });

  return (
    <div className="checkers-game">
      {side === 1 ? (
        <UIPlayer board={board} side={side} moveComplete={moveComplete} />
      ) : (
        <AIPlayer board={board} side={side} moveComplete={moveComplete} />
      )}
      <History moves={hist} />
    </div>
  );
}
