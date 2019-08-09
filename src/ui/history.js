import React, { createRef, useCallback, useLayoutEffect } from 'react';

import { moveToString } from '../core/utils';

export default function History({ moves }) {
  const ref = createRef();

  useLayoutEffect(() => {
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [ref]);

  // pad the row if there's only one move
  const getRow = useCallback(i => {
    const row = moves.slice(i * 2, i * 2 + 2);
    if (row.length == 1) {
      row.push(null);
    }
    return row;
  }, []);

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
          {Array(Math.ceil(moves.length / 2))
            .fill()
            .map((_, i) => (
              <tr key={i}>
                {getRow(i).map((move, j) =>
                  move ? (
                    <td key={j}>{moveToString(move)}</td>
                  ) : (
                    <td className="thinking" key={j}>
                      <img src="src/images/thinking.svg" />
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
