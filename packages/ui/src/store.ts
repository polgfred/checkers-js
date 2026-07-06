import { useState, useSyncExternalStore } from 'preact/compat';

import {
  type BoardType,
  copyBoard,
  makeRules,
  newBoard,
  type PlayType,
  type Rules,
  SideType,
  type TreeType,
} from '@checkers/core';

const { RED } = SideType;

type HistEntry = PlayType | null;

export type History = [HistEntry, HistEntry][];

export type GameSnapshot = {
  board: BoardType;
  side: SideType;
  plays: TreeType;
  hist: History;
};

type GameSubscriber = (listener: () => void) => () => void;

export type GameStore = {
  snapshot: () => GameSnapshot;
  subscribe: GameSubscriber;
  publish: () => void;
  handlePlay: (play: PlayType) => void;
  startGame: () => void;
};

function createGameStore() {
  let rules: Rules;
  let side: SideType;
  let hist: History;
  let snapshot: GameSnapshot;

  const events = new EventTarget();

  function readSnapshot() {
    return {
      board: copyBoard(rules.board),
      side,
      plays: rules.buildTree(side),
      hist: [...hist],
    };
  }

  function subscribe(listener: () => void) {
    events.addEventListener('change', listener);
    return () => {
      events.removeEventListener('change', listener);
    };
  }

  function publish() {
    snapshot = readSnapshot();
    events.dispatchEvent(new CustomEvent('change'));
  }

  function handlePlay(play: PlayType) {
    if (play.kind === 'jump') {
      rules.doJump(side, play);
    } else {
      rules.doMove(side, play);
    }
    if (side === RED) {
      hist.push([play, null]);
    } else if (hist.length > 0) {
      const last = hist[hist.length - 1];
      last[1] = play;
    }
    publish();
  }

  function startGame() {
    rules = makeRules(newBoard());
    side = RED;
    hist = [];
    publish();
  }

  startGame();

  return {
    snapshot: () => snapshot,
    subscribe,
    publish,
    handlePlay,
    startGame,
  };
}

export function useGameStore() {
  const [store] = useState(() => createGameStore());
  const snapshot = useSyncExternalStore(store.subscribe, store.snapshot);
  return {
    snapshot,
    handlePlay: store.handlePlay,
    startGame: store.startGame,
  };
}
