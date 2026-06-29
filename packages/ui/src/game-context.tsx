import { createContext, useContext } from 'preact/compat';
import { BoardType, SideType, TreeType } from '@checkers/core';

import type { Coords } from './types';
import type { History } from './store';

export interface GameContextType {
  board: BoardType;
  side: SideType;
  plays: TreeType;
  hist: History;
  canMove: (xy: Coords) => boolean;
  canMoveTo: (xy: Coords, nxny: Coords) => boolean;
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('GameContext is missing. Wrap with GameContext.Provider.');
  }
  return context;
}
