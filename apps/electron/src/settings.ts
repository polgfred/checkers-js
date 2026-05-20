import Store from 'electron-store';

import {
  DEFAULT_DIFFICULTY,
  isDifficulty,
  type Difficulty,
} from './difficulty';
import { DEFAULT_THEME, isThemeClass, type ThemeClass } from './theme';

type Settings = {
  theme: ThemeClass;
  difficulty: Difficulty;
};

const store = new Store<Settings>({
  defaults: {
    theme: DEFAULT_THEME,
    difficulty: DEFAULT_DIFFICULTY,
  },
});

export function getThemeSetting(): ThemeClass {
  const theme = store.get('theme');
  return isThemeClass(theme) ? theme : DEFAULT_THEME;
}

export function setThemeSetting(theme: ThemeClass): void {
  store.set('theme', theme);
}

export function getDifficultySetting(): Difficulty {
  const difficulty = store.get('difficulty');
  return isDifficulty(difficulty) ? difficulty : DEFAULT_DIFFICULTY;
}

export function setDifficultySetting(difficulty: Difficulty): void {
  store.set('difficulty', difficulty);
}
