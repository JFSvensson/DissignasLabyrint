export const PLAYER_CONSTANTS = {
  START_POSITION: {
    x: 1,
    y: 0.3,
    z: 1
  },
  SIZE: 0.3,
  TEXTURE: {
    SIZE: 64,
    SQUARE_SIZE: 16,
    COLORS: {
      PRIMARY: '#2cff2c',
      SECONDARY: '#0f7d0f'
    }
  },
  MOVE_DURATION: 200, // ms for smooth movement tween
};

export const MAZE_COLORS = {
  WALL: 0x9757e3,
  FLOOR: 0x222233,
  GRID: 0x444466,
  GOAL: 0xFFD700,
  VISITED: 0x2a6e2a,
  COORDINATE_TEXT: 0xffffff,
  GRID_LINE: 0x555577,
  AMBIENT_LIGHT: 0x8888cc,
  DIRECTIONAL_LIGHT: 0xffeedd,
};

export const MAZE_VISUAL = {
  WALL_HEIGHT: 0.35,
  GOAL_HEIGHT: 0.06,
  GRID_OPACITY: 0.25,
  VISITED_OPACITY: 0.5,
  GRID_LINE_OPACITY: 0.25,
  FLOOR_Y: -0.05,
  COORDINATE_SIZE: 0.4,
};
