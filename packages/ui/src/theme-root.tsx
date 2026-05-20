import type { PropsWithChildren } from 'react';

import type { ThemeClass } from './theme';
import styles from './styles.module.css';

export interface ThemeRootProps extends PropsWithChildren {
  theme: ThemeClass;
}

export function ThemeRoot({ children, theme }: ThemeRootProps) {
  return (
    <div className={styles.themeRoot} data-theme={theme}>
      {children}
    </div>
  );
}
