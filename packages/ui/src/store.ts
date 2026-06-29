import { makeRules, newBoard, PlayType, SideType } from '@checkers/core';
import { useState, useSyncExternalStore } from 'preact/compat';

const { RED } = SideType;

type HistEntry = PlayType | null;

function createGameStore() {
  const events = new EventTarget();
  const rules = makeRules(newBoard(), RED);
  const hist = [] as [HistEntry, HistEntry][];

  let snapshot = readSnapshot();

  function readSnapshot() {
    return {
      board: rules.getBoard(),
      side: rules.getSide(),
      plays: rules.buildTree(),
      hist: [...hist],
      handlePlay,
    };
  }

  function handlePlay(play: PlayType) {
    const moveSide = rules.getSide();
    rules.doPlay(play);
    if (moveSide === RED) {
      hist.push([play, null]);
    } else if (hist.length > 0) {
      const last = hist[hist.length - 1];
      last[1] = play;
    }
    publish();
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

  return {
    snapshot: () => snapshot,
    subscribe,
  };
}

export function useGameStore() {
  const [store, setStore] = useState(() => createGameStore());
  return useSyncExternalStore(store.subscribe, store.snapshot);
}
