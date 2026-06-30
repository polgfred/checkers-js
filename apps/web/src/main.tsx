import { createRoot } from 'preact/compat/client';

import type { BoardType, PlayType, SideType } from '@checkers/core';
import { DEFAULT_THEME, Game, ThemeRoot } from '@checkers/ui';

import './app.css';

type Root = ReturnType<typeof createRoot>;

type WorkerResponse = {
  move: PlayType | null;
};

const worker = new Worker(new URL('./analyze-worker.ts', import.meta.url), {
  type: 'module',
});

function getMove(board: BoardType, side: SideType) {
  return new Promise<PlayType | null>((resolve) => {
    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      resolve(ev.data.move);
      worker.onmessage = null;
    };
    worker.postMessage({ board, side });
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
