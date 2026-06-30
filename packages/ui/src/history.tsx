import { useLayoutEffect, useRef } from 'preact/compat';

import { moveToString } from '@checkers/core';

import { useGameContext } from './game-context';
import thinkingSpinnerUrl from './images/thinking.svg';
import styles from './styles.module.css';

export function History() {
  const { hist } = useGameContext();

  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [hist]);

  return (
    <div
      ref={ref}
      className={`${styles.panelSurface} ${styles.historyContainer}`}
    >
      <table className={styles.historyTable}>
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
                  <td className={styles.thinking} key={j}>
                    <span>
                      <img
                        className={styles.thinkingSpinner}
                        src={thinkingSpinnerUrl}
                        alt=""
                      />
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
