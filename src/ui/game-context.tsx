import { createContext, useContext } from 'react';
import { BoardType, PlayType, SideType, TreeType } from '../core/types';

export interface GameContextType {
  board: BoardType;
  side: SideType;
  plays: TreeType;
  hist: readonly (readonly [PlayType | null, PlayType | null])[];
  handlePlay(move: PlayType): void;
  handleComputerPlay(): void;
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('GameContext is missing. Wrap with GameContext.Provider.');
  }
  return context;
}
