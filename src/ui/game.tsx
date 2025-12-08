import { useState } from 'react';

import { type MoveType, SideType } from '../core/types';
import { makeRules } from '../core/rules';
import { newBoard } from '../core/utils';

import { GameContext } from './game-context';
import { HumanPlayer } from './human-player';
import { ComputerPlayer } from './computer-player';
import { History } from './history';

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
        handlePlay(move: MoveType) {
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
