import { MazeRenderer } from './MazeRenderer';

export function initWebGame() {
  const maze = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];

  new MazeRenderer('maze-container', maze);

  // Implementera webbaserad spellogik här
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    initWebGame();
  };
}

