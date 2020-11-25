import React, {
  createRef,
  useCallback,
  useContext,
  useLayoutEffect,
} from 'react';

import { moveToString } from '../core/utils';

import ThinkingSpinner from '../images/thinking.svg';

import { GameContext } from './game_context';

export function History(): JSX.Element {
  const { hist } = useContext(GameContext);

  const ref = createRef<HTMLDivElement>();

  useLayoutEffect(() => {
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [ref]);

  // pad the row if there's only one move
  const getRow = useCallback(
    (i: number) => {
      const row = hist.slice(i * 2, i * 2 + 2);
      if (row.length == 1) {
        row.push(null);
      }
      return row;
    },
    [hist]
  );

  return (
    <div ref={ref} className="history-container">
      <table className="history">
        <thead>
          <tr>
            <th>Red</th>
            <th>White</th>
          </tr>
        </thead>
        <tbody>
          {Array(Math.ceil(hist.length / 2))
            .fill(null)
            .map((_, i) => (
              <tr key={i}>
                {getRow(i).map((move, j) =>
                  move ? (
                    <td key={j}>{moveToString(move)}</td>
                  ) : (
                    <td className="thinking" key={j}>
                      <span>
                        <ThinkingSpinner />
                      </span>
                    </td>
                  )
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
