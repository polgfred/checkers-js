import { contextBridge, ipcRenderer } from 'electron';

import type { BoardType, SideType } from '@checkers/core';
import { isThemeClass, type ThemeClass } from './theme';

contextBridge.exposeInMainWorld('checkers', {
  getMove(board: BoardType, side: SideType) {
    return ipcRenderer.invoke('checkers:getMove', board, side);
  },
  getTheme() {
    return ipcRenderer.invoke('checkers:getTheme');
  },
  onThemeChanged(listener: (theme: ThemeClass) => void): () => void {
    const handler = (_ev: Electron.IpcRendererEvent, value: string) => {
      if (isThemeClass(value)) {
        listener(value);
      }
    };
    ipcRenderer.on('checkers:themeChanged', handler);
    return () => {
      ipcRenderer.off('checkers:themeChanged', handler);
    };
  },
});
