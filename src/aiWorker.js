importScripts('rules.js');

addEventListener('message', function (event) {
  var player = new Rules.Player(event.data.board, event.data.side);
  postMessage({ move: player.run()[0] });
}, false);
