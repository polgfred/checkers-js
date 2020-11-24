import { Board } from './core/rules';
import { analyze } from './core/analyzer';

// tell typescript that we're in a web worker, as the
// postMessage API is slightly different
declare const self: DedicatedWorkerGlobalScope;

self.addEventListener(
  'message',
  (ev: { data: { board: Board; side: number } }) => {
    const { board, side } = ev.data;
    const [move] = analyze(board, side);
    self.postMessage({ move });
  },
  false
);
