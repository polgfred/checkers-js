import Analyzer from './core/analyzer';

addEventListener('message', ev => {
  let { board, side } = ev.data, analyzer = new Analyzer(board, side);
  postMessage({ move: analyzer.run()[0] });
}, false);
