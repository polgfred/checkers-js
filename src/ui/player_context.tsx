import { createContext } from 'react';

import { Coords } from './types';

export type PlayerContextType = {
  canDrag: (xy: Coords) => boolean;
  canDrop: (xy: Coords, nxny: Coords) => boolean;
  endDrag: (xy: Coords, nxny: Coords) => void;
};

export const PlayerContext = createContext<PlayerContextType>({
  canDrag: () => false,
  canDrop: () => false,
  endDrag: () => undefined,
});
