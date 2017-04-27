import Player from './player';

addEventListener('message', (ev) => {
  let { board, side } = ev.data, player = new Player(board, side);
  postMessage({ move: player.run()[0] });
}, false);
