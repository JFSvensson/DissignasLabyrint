/**
 * Visual themes that rotate by level group.
 *
 * Levels 1-3 → Stone Dungeon (default purple)
 * Levels 4-5 → Forest
 * Levels 6-7 → Space Station
 */

export interface MazeTheme {
  name: string;
  wallColor: string;
  wallGrout: string;
  floorColor1: string;
  floorColor2: string;
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  directionalColor: number;
}

export const THEMES: MazeTheme[] = [
  {
    name: 'stone',
    wallColor: '#7744aa',
    wallGrout: '#332255',
    floorColor1: '#1a1a2e',
    floorColor2: '#24243a',
    fogColor: 0x110022,
    fogDensity: 0.12,
    ambientColor: 0x8888cc,
    directionalColor: 0xffeedd,
  },
  {
    name: 'forest',
    wallColor: '#3a7d44',
    wallGrout: '#1a3d20',
    floorColor1: '#1a2e1a',
    floorColor2: '#243a20',
    fogColor: 0x0a1f0a,
    fogDensity: 0.10,
    ambientColor: 0x88cc88,
    directionalColor: 0xffffcc,
  },
  {
    name: 'space',
    wallColor: '#445577',
    wallGrout: '#1a2233',
    floorColor1: '#0a0a1e',
    floorColor2: '#141428',
    fogColor: 0x050510,
    fogDensity: 0.08,
    ambientColor: 0x6688cc,
    directionalColor: 0xccddff,
  },
];

export function getThemeForLevel(level: number): MazeTheme {
  if (level >= 6) return THEMES[2]; // space
  if (level >= 4) return THEMES[1]; // forest
  return THEMES[0]; // stone
}

/** Pick a theme for free play based on maze size. */
export function getThemeForMazeSize(mazeSize: number): MazeTheme {
  if (mazeSize >= 11) return THEMES[2]; // space
  if (mazeSize >= 7)  return THEMES[1]; // forest
  return THEMES[0]; // stone
}
