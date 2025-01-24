import React, { useState } from 'react';

import { makeRules } from '../core/rules';
import { MoveType, SideType } from '../core/types';
import { newBoard } from '../core/utils';

import { ComputerPlayer } from './computer_player';
import { GameContext } from './game_context';
import { History } from './history';
import { HumanPlayer } from './human_player';

const { RED } = SideType;

export function Game() {
  const [{ getBoard, getSide, doPlay, buildTree }] = useState(() =>
    makeRules(newBoard(), RED)
  );
  const board = getBoard();
  const side = getSide();
  const plays = buildTree();
  const [hist] = useState([] as MoveType[]);
  const [, setClock] = useState(0);

  return (
    <GameContext.Provider
      value={{
        board,
        side,
        plays,
        hist,
        makeMove: (move: MoveType) => {
          doPlay(move);
          hist.push(move);
          setClock(Date.now());
        },
      }}
    >
      <div className="game-container">
        {side === RED ? <HumanPlayer /> : <ComputerPlayer />}
        <History />
      </div>
    </GameContext.Provider>
  );
}
