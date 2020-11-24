import { Board } from './core/rules';
import { analyze } from './core/analyzer';

addEventListener(
  'message',
  (ev: { data: { board: Board; side: number } }) => {
    const { board, side } = ev.data;
    const [move] = analyze(board, side);
    // @ts-ignore
    postMessage({ move });
  },
  false
);
