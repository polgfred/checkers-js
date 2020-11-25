import { createContext } from 'react';
import { BoardType, MoveType, SideType, TreeType } from '../core/types';

export type GameContextType = {
  board: BoardType;
  side: SideType;
  plays: TreeType;
  hist: MoveType[];
  makeMove: (move: MoveType) => void;
};

export const GameContext = createContext<GameContextType>(null);
