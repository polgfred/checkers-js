import { useLayoutEffect, useRef } from 'react';
import { moveToString } from '../core/utils';

import ThinkingSpinner from '../images/thinking.svg';

import { useGameContext } from './game-context';

export function History() {
  const { hist } = useGameContext();

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [ref]);

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
          {hist.map((row, i) => (
            <tr key={i}>
              {row.map((move, j) =>
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
