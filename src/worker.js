import Analyzer from './analyzer';

addEventListener('message', ev => {
  let { board, side } = ev.data, analyzer = new Analyzer(board, side);
  postMessage({ move: analyzer.run()[0] });
}, false);
