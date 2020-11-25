import { createContext } from 'react';
import { BoardType, MoveType, TreeType } from '../core/rules';

export type GameContextType = {
  board: BoardType;
  side: number;
  plays: TreeType;
  hist: MoveType[];
  makeMove: (move: MoveType) => void;
};

export const GameContext = createContext<GameContextType>(null);
