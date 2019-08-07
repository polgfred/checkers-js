import React, { createRef, useLayoutEffect } from 'react';

import { moveToString } from '../core/utils';

export default function History({ moves }) {
  const ref = createRef();

  useLayoutEffect(() => {
    ref.current.scrollTop = ref.current.scrollHeight;
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
          {Array(Math.ceil(moves.length / 2))
            .fill()
            .map((_, i) => (
              <tr key={i}>
                {moves.slice(i * 2, i * 2 + 2).map((move, j) => (
                  <td key={j}>{moveToString(move)}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
