import React, { useState } from 'react';

import { MoveType } from '../core/types';
import { makeRules } from '../core/rules';
import { newBoard } from '../core/utils';

import { GameContext } from './game_context';
import { UIPlayer } from './ui_player';
import { AIPlayer } from './ai_player';
import { History } from './history';

export function Game(): JSX.Element {
  const [rules] = useState(() => makeRules(newBoard(), 1));
  const [hist] = useState([] as MoveType[]);
  const [, setClock] = useState(0);

  return (
    <GameContext.Provider
      value={{
        board: rules.getBoard(),
        side: rules.getSide(),
        plays: rules.buildTree(),
        hist,
        makeMove: (move: MoveType) => {
          rules.doPlay(move);
          hist.push(move);
          setClock(Date.now());
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
