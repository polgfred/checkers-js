import React, { useState } from 'react';

import { Board, Move } from '../core/rules';
import { newBoard } from '../core/utils';

import { GameContext } from './game_context';
import { UIPlayer } from './ui_player';
import { AIPlayer } from './ai_player';
import { History } from './history';

export function Game() {
  const [{ board, side, hist }, setGame] = useState<{
    board: Board;
    side: number;
    hist: Move[];
  }>({
    board: newBoard(),
    side: 1,
    hist: [],
  });

  return (
    <GameContext.Provider
      value={{
        getBoard: () => board,
        getSide: () => side,
        getHistory: () => hist,
        makeMove: (move: Move) => {
          hist.push(move);
          setGame({ board, side: -side, hist });
        },
      }}
    >
      <div className="checkers-game">
        {side === 1 ? <UIPlayer /> : <AIPlayer />}
        <History />
      </div>
    </GameContext.Provider>
  );
}
