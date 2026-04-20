import { getThemeForLevel, getThemeForMazeSize, THEMES } from '../../src/game/themes';

describe('getThemeForLevel', () => {
  it('returns stone theme for levels 1-3', () => {
    expect(getThemeForLevel(1).name).toBe('stone');
    expect(getThemeForLevel(2).name).toBe('stone');
    expect(getThemeForLevel(3).name).toBe('stone');
  });

  it('returns forest theme for levels 4-5', () => {
    expect(getThemeForLevel(4).name).toBe('forest');
    expect(getThemeForLevel(5).name).toBe('forest');
  });

  it('returns space theme for levels 6-7', () => {
    expect(getThemeForLevel(6).name).toBe('space');
    expect(getThemeForLevel(7).name).toBe('space');
  });

  it('has three themes defined', () => {
    expect(THEMES).toHaveLength(3);
  });

  it('each theme has all required properties', () => {
    for (const theme of THEMES) {
      expect(theme.name).toBeDefined();
      expect(theme.wallColor).toBeDefined();
      expect(theme.wallGrout).toBeDefined();
      expect(theme.floorColor1).toBeDefined();
      expect(theme.floorColor2).toBeDefined();
      expect(typeof theme.fogColor).toBe('number');
      expect(typeof theme.fogDensity).toBe('number');
      expect(typeof theme.ambientColor).toBe('number');
      expect(typeof theme.directionalColor).toBe('number');
    }
  });
});

describe('getThemeForMazeSize', () => {
  it('returns stone theme for small mazes (5)', () => {
    expect(getThemeForMazeSize(5).name).toBe('stone');
  });

  it('returns forest theme for medium mazes (7-9)', () => {
    expect(getThemeForMazeSize(7).name).toBe('forest');
    expect(getThemeForMazeSize(9).name).toBe('forest');
  });

  it('returns space theme for large mazes (11+)', () => {
    expect(getThemeForMazeSize(11).name).toBe('space');
    expect(getThemeForMazeSize(13).name).toBe('space');
  });
});
