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
  const [target, setTarget] = useState<Coords | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(null);

  const startDrag = useCallback(
    (next: Source, event: PointerEvent) => {
      event.preventDefault();
      setSource(next);
      setTarget(null);
      setOrigin({ x: event.clientX, y: event.clientY });

      // one controller tears down every listener at once, however the drag ends
      const controller = new AbortController();
      const { signal } = controller;

      const end = () => {
        controller.abort();
        setSource(null);
        setTarget(null);
        setOrigin(null);
      };

      window.addEventListener(
        'pointermove',
        (e: PointerEvent) => {
          const sq = squareAt(e.clientX, e.clientY);
          // return the same ref when unchanged so Preact skips the re-render
          setTarget((prev) =>
            prev?.x === sq?.x && prev?.y === sq?.y ? prev : sq
          );
        },
        { signal }
      );

      window.addEventListener(
        'pointerup',
        (e: PointerEvent) => {
          const target = squareAt(e.clientX, e.clientY);
          if (target) onDrop(next, target);
          end();
        },
        { signal }
      );

      // interrupted drag (context menu, browser gesture) — abort cleanly
      window.addEventListener('pointercancel', end, { signal });

      // keep a stationary hold from popping the context menu mid-drag
      window.addEventListener('contextmenu', (e: Event) => e.preventDefault(), {
        signal,
      });
    },
    [onDrop]
  );

  return (
    <DragContext.Provider value={{ source, target, origin, startDrag }}>
      {children}
    </DragContext.Provider>
  );
}
