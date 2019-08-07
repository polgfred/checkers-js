import Analyzer from './core/analyzer';

addEventListener(
  'message',
  ev => {
    const { board, side } = ev.data;
    const analyzer = new Analyzer(board, side);
    postMessage({ move: analyzer.run()[0] });
  },
  false
);
