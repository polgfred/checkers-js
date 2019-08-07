import React, { createRef, useLayoutEffect } from 'react';

import { moveToString } from '../core/utils';

export default function History({ moves }) {
  const ref = createRef();

  useLayoutEffect(() => {
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [ref]);

  const elems = [];

  for (let i = 0; i < moves.length; i += 2) {
    elems.push(
      <tr key={i}>
        <td>{moveToString(moves[i])}</td>
        <td>{moveToString(moves[i + 1])}</td>
      </tr>
    );
  }

  return (
    <div ref={ref} className="history-container">
      <table className="history">
        <thead>
          <tr>
            <th>Red</th>
            <th>White</th>
          </tr>
        </thead>
        <tbody>{elems}</tbody>
      </table>
    </div>
  );
}
