/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />

import type { BoardType, SideType, PlayType } from '@checkers/core';
import type { ThemeClass } from './src/theme';

interface CheckersObject {
  getMove(board: BoardType, side: SideType): Promise<PlayType>;
  getTheme(): Promise<ThemeClass>;
  onThemeChanged(listener: (theme: ThemeClass) => void): () => void;
}

declare global {
  interface Window {
    checkers: CheckersObject;
  }
}
