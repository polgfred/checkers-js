import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'preact/compat';

import type { Coords, PieceAtCoords } from './types';

type Source = PieceAtCoords;

type DragContextValue = {
  source: PieceAtCoords | null;
  target: Coords | null;
  origin: Coords | null;
  startDrag: (source: Source, event: PointerEvent) => void;
};

const DragContext = createContext<DragContextValue | null>(null);

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) throw new Error('no drag provider');
  return context;
}

// find the playable board square under the pointer, if any
function squareAt(clientX: number, clientY: number): Coords | null {
  const el = document.elementFromPoint(clientX, clientY);
  const cell = el?.closest<HTMLElement>('[data-square]');
  if (!cell) return null;
  return { x: Number(cell.dataset.x), y: Number(cell.dataset.y) };
}

export function DragProvider({
  onDrop,
  children,
}: {
  onDrop: (source: Coords, target: Coords) => void;
  children: ReactNode;
}) {
  const [source, setSource] = useState<Source | null>(null);
  const [over, setOver] = useState<Coords | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(null);

  const startDrag = useCallback(
    (next: Source, event: PointerEvent) => {
      event.preventDefault();
      setSource(next);
      setOver(null);
      setOrigin({ x: event.clientX, y: event.clientY });

      const onMove = (e: PointerEvent) => {
        const sq = squareAt(e.clientX, e.clientY);
        // return the same ref when unchanged so Preact skips the re-render
        setOver((prev) => (prev?.x === sq?.x && prev?.y === sq?.y ? prev : sq));
      };

      const onUp = (e: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        const target = squareAt(e.clientX, e.clientY);
        if (target) onDrop(next, target);
        setSource(null);
        setOver(null);
        setOrigin(null);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [onDrop]
  );

  return (
    <DragContext.Provider value={{ source, target: over, origin, startDrag }}>
      {children}
    </DragContext.Provider>
  );
}
