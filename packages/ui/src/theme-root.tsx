import type { PropsWithChildren } from 'preact/compat';

import styles from './styles.module.css';
import type { ThemeClass } from './theme';

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
