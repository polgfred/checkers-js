import { createRoot, type Root } from 'react-dom/client';

import { BoardType, PlayType, SideType } from '@checkers/core';
import { DEFAULT_THEME, Game, ThemeRoot } from '@checkers/ui';

import './app.css';

type WorkerResponse = {
  id: number;
  move: PlayType | null;
};

const worker = new Worker(new URL('./analyze-worker.ts', import.meta.url), {
  type: 'module',
});
let nextJobId = 0;
const pending = new Map<number, (move: PlayType | null) => void>();

worker.addEventListener('message', (ev: MessageEvent<WorkerResponse>) => {
  const { id, move } = ev.data;
  pending.get(id)?.(move);
  pending.delete(id);
});

function getMove(board: BoardType, side: SideType) {
  return new Promise<PlayType | null>((resolve) => {
    const id = nextJobId++;
    pending.set(id, resolve);
    worker.postMessage({ id, board, side });
  });
}

const elem = document.getElementById('checkers-container')!;
const app = (
  <ThemeRoot theme={DEFAULT_THEME}>
    <Game getMove={getMove} />
  </ThemeRoot>
);

if (import.meta.hot) {
  const hotData = import.meta.hot.data as { root?: Root };
  const root = (hotData.root ??= createRoot(elem));
  root.render(app);
} else {
  createRoot(elem).render(app);
}
