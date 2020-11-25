import { createContext } from 'react';
import { Board, Move, Tree } from '../core/rules';

export type GameContextType = {
  getBoard: () => Board;
  getSide: () => number;
  buildTree: () => Tree;
  getHistory: () => Move[];
  makeMove: (move: Move) => void;
};

export const GameContext = createContext<GameContextType>(null);
