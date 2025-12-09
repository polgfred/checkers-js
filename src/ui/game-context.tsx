import { createContext } from 'react';
import { BoardType, MoveType, SideType, TreeType } from '../core/types';

export interface GameContextType {
  board: BoardType;
  side: SideType;
  plays: TreeType;
  hist: readonly MoveType[];
  handlePlay(move: MoveType): void;
  handleComputerPlay(): void;
}

export const GameContext = createContext<GameContextType>(null);
