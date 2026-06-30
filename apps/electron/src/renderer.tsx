import { useEffect, useState } from 'preact/compat';
import { createRoot } from 'preact/compat/client';

import { Game, ThemeRoot } from '@checkers/ui';

import { DEFAULT_THEME } from './theme';

import './renderer.css';

function App() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isThemeReady, setThemeReady] = useState(false);

  useEffect(() => {
    window.checkers
      .getTheme()
      .then(setTheme)
      .finally(() => setThemeReady(true));

    return window.checkers.onThemeChanged(setTheme);
  }, []);

  if (!isThemeReady) {
    return null;
  }

  return (
    <ThemeRoot theme={theme}>
      <Game getMove={window.checkers.getMove} />
    </ThemeRoot>
  );
}

const elem = document.getElementById('checkers-container')!;
createRoot(elem).render(<App />);
