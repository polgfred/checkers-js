import { createContext } from 'react';
import { BoardType, MoveType, SideType, TreeType } from '../core/types.js';

export interface GameContextType {
  board: BoardType;
  side: SideType;
  plays: TreeType;
  hist: readonly MoveType[];
  makeMove: (move: MoveType) => void;
}

export const GameContext = createContext<GameContextType>(null);
