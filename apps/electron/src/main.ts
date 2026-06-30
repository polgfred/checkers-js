import os from 'node:os';
import path from 'node:path';

import { BrowserWindow, Menu, app, ipcMain } from 'electron';
import started from 'electron-squirrel-startup';
import Piscina from 'piscina';

import type { BoardType, SideType } from '@checkers/core';

import { DIFFICULTIES, DIFFICULTY_DEPTH, type Difficulty } from './difficulty';
import {
  getDifficultySetting,
  getThemeSetting,
  setDifficultySetting,
  setThemeSetting,
} from './settings';
import { THEMES, type ThemeClass } from './theme';

const analyzerPool = new Piscina({
  filename: path.join(__dirname, 'analyze-worker.js'),
  minThreads: 1,
  maxThreads: Math.floor(os.cpus().length / 2),
});

// Difficulty Level
let currentDifficulty: Difficulty = getDifficultySetting();

function prettyDifficultyLabel(difficulty: Difficulty): string {
  return difficulty.replace(/^\w/, (ch) => ch.toUpperCase());
}

function applyDifficulty(difficulty: Difficulty) {
  currentDifficulty = difficulty;
  setDifficultySetting(difficulty);
}

// Color Theme
let currentTheme: ThemeClass = getThemeSetting();

function prettyThemeLabel(theme: ThemeClass): string {
  return theme.replace(/^theme-/, '').replace(/^\w/, (ch) => ch.toUpperCase());
}

function applyTheme(theme: ThemeClass) {
  currentTheme = theme;
  setThemeSetting(theme);
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('checkers:themeChanged', theme);
  }
}

// App Menu
function buildAppMenu() {
  const fileMenu = {
    label: 'File',
    submenu: [
      {
        label: 'New Game',
        accelerator: 'CommandOrControl+N',
        click: () => {
          const target =
            BrowserWindow.getFocusedWindow() ??
            BrowserWindow.getAllWindows()[0];
          if (target) {
            target.reload();
            return;
          }
          createWindow();
        },
      },
      { type: 'separator' },
      { role: 'close' },
      ...(process.platform === 'darwin' ? [] : [{ role: 'quit' } as const]),
    ],
  } satisfies Electron.MenuItemConstructorOptions;

  const computerMenu = {
    label: 'Computer',
    submenu: DIFFICULTIES.map((difficulty) => ({
      label: prettyDifficultyLabel(difficulty),
      type: 'radio',
      checked: difficulty === currentDifficulty,
      click: () => {
        applyDifficulty(difficulty);
      },
    })),
  } satisfies Electron.MenuItemConstructorOptions;

  const viewMenu = {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { type: 'separator' },
      { role: 'toggleDevTools' },
    ],
  } satisfies Electron.MenuItemConstructorOptions;

  const themeMenu = {
    label: 'Theme',
    submenu: THEMES.map((theme) => ({
      label: prettyThemeLabel(theme),
      type: 'radio',
      checked: theme === currentTheme,
      click: () => {
        applyTheme(theme);
      },
    })),
  } satisfies Electron.MenuItemConstructorOptions;

  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' } as const] : []),
    fileMenu,
    viewMenu,
    computerMenu,
    themeMenu,
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

ipcMain.handle('checkers:getTheme', () => currentTheme);

ipcMain.handle(
  'checkers:getMove',
  async (_ev, board: BoardType, side: SideType) => {
    const depth = DIFFICULTY_DEPTH[currentDifficulty];
    return analyzerPool.run({ board, side, depth });
  }
);

// Create the browser window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1040,
    height: 580,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  buildAppMenu();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  await analyzerPool.destroy();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
