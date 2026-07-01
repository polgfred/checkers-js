import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'preact/compat';

import type { PieceType } from '@checkers/core';

type DragState = { x: number; y: number; p: PieceType } | null;

type DragContext = {
  source: DragState;
  setDrag: (x: number, y: number, p: PieceType) => void;
  clearDrag: () => void;
};

const defaultContext: DragContext = {
  source: null,
  setDrag: () => {},
  clearDrag: () => {},
};

const DragContext = createContext<DragContext>(defaultContext);

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) throw new Error('no drag provider');
  return context;
}

export function DragProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<DragState>(null);

  const context: DragContext = {
    source: source,
    setDrag: (x, y, p) => setSource({ x, y, p }),
    clearDrag: () => setSource(null),
  };

  return (
    <DragContext.Provider value={context}>{children}</DragContext.Provider>
  );
}
