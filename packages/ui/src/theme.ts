export const THEMES = [
  'theme-wood',
  'theme-slate',
  'theme-emerald',
  'theme-sunset',
] as const;

export type ThemeClass = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeClass = 'theme-wood';

export function isThemeClass(value: string): value is ThemeClass {
  return (THEMES as readonly string[]).includes(value);
}
