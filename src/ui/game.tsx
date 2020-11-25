import React, { useState } from 'react';

import { Move, makeRules } from '../core/rules';
import { newBoard } from '../core/utils';

import { GameContext } from './game_context';
import { UIPlayer } from './ui_player';
import { AIPlayer } from './ai_player';
import { History } from './history';

export function Game(): JSX.Element {
  const [rules] = useState(() => makeRules(newBoard(), 1));
  const [hist, setHist] = useState([]);

  return (
    <GameContext.Provider
      value={{
        getBoard: () => rules.getBoard(),
        getSide: () => rules.getSide(),
        buildTree: () => rules.buildTree(),
        getHistory: () => hist,
        makeMove: (move: Move) => {
          rules.doPlay(move);
          setHist([...hist, move]);
        },
      }}
    >
      <div className="checkers-game">
        {rules.getSide() === 1 ? <UIPlayer /> : <AIPlayer />}
        <History />
      </div>
    </GameContext.Provider>
  );
}
