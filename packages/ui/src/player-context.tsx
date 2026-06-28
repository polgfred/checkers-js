import { createContext } from 'preact/compat';

import type { Coords } from './types';

export interface PlayerContextType {
  canMove: (xy: Coords) => boolean;
  canMoveTo: (xy: Coords, nxny: Coords) => boolean;
  moveTo: (xy: Coords, nxny: Coords) => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  canMove: () => false,
  canMoveTo: () => false,
  moveTo: () => undefined,
});
