import { createContext, useContext } from 'react';
import { Board, Move } from '../core/rules';

export type GameContextType = {
  getBoard: () => Board;
  getSide: () => number;
  getHistory: () => Move[];
  makeMove: (move: Move) => void;
};

export const GameContext = createContext<GameContextType>(null);
