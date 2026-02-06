import { useCallback, useEffect, useRef, useState } from 'react';
import { castDraft, produce } from 'immer';

import { type PlayType, SideType } from '../core/types';
import { makeRules } from '../core/rules';
import { newBoard } from '../core/utils';

import { GameContext } from './game-context';
import { HumanPlayer } from './human-player';
import { ComputerPlayer } from './computer-player';
import { History } from './history';

const { RED } = SideType;

export function Game() {
  const [{ getBoard, getSide, doPlay, buildTree }] = useState(() =>
    makeRules(newBoard(), RED)
  );

  const board = getBoard();
  const side = getSide();
  const plays = buildTree();
  const [hist, setHist] = useState([] as [PlayType | null, PlayType | null][]);

  // make this play, update the history, and force a re-render
  const handlePlay = useCallback(
    (move: PlayType) => {
      const moveSide = getSide();
      doPlay(move);
      setHist((prev) =>
        produce(prev, (draft) => {
          if (moveSide === RED) {
            draft.push([castDraft(move), null]);
            return;
          }
          const last = draft[draft.length - 1];
          if (!last || last[1] !== null) {
            return;
          }
          last[1] = castDraft(move);
        })
      );
    },
    [doPlay, getSide]
  );

  // set up the web worker for computer moves
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    worker.current = new Worker('./worker.js');
    worker.current.addEventListener(
      'message',
      (ev: { data: { move: PlayType | undefined } }) => {
        const { move } = ev.data;
        if (move) {
          handlePlay(move);
        }
      }
    );

    return () => {
      worker.current?.terminate();
    };
  }, [handlePlay, worker]);

  // ask the worker to compute a move
  const handleComputerPlay = useCallback(() => {
    worker.current?.postMessage({ board, side });
  }, [worker, board, side]);

  return (
    <GameContext.Provider
      value={{
        board,
        side,
        plays,
        hist,
        handlePlay,
        handleComputerPlay,
      }}
    >
      <div className="game-container">
        {side === RED ? <HumanPlayer /> : <ComputerPlayer />}
        <History />
      </div>
    </GameContext.Provider>
  );
}
