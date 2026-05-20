import { createContext, useContext } from 'react';
import { BoardType, PlayType, SideType, TreeType } from '@checkers/core';

import type { GetMove } from './game';

export interface GameContextType {
  board: BoardType;
  side: SideType;
  plays: TreeType;
  hist: readonly (readonly [PlayType | null, PlayType | null])[];
  getMove: GetMove;
  handlePlay(move: PlayType): void;
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('GameContext is missing. Wrap with GameContext.Provider.');
  }
  return context;
}
