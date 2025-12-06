import { useState } from 'react';

import { MoveType, SideType } from '../core/types.js';
import { makeRules } from '../core/rules.js';
import { newBoard } from '../core/utils.js';

import { GameContext } from './game_context.js';
import { HumanPlayer } from './human_player.js';
import { ComputerPlayer } from './computer_player.js';
import { History } from './history.js';

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
