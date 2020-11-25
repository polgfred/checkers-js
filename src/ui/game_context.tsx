import { createContext } from 'react';
import { Board, Move, Tree } from '../core/rules';

export type GameContextType = {
  board: Board;
  side: number;
  plays: Tree;
  hist: Move[];
  makeMove: (move: Move) => void;
};

export const GameContext = createContext<GameContextType>(null);
