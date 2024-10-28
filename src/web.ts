import { MazeRenderer } from './game/MazeRenderer';
import { MazeLogic } from './game/MazeLogic';
import { Direction } from './game/types';
import { QuestionGenerator } from './game/QuestionGenerator';
import { GameUI } from './game/UI';

export function initWebGame() {
  const mazeLayout = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];

  const mazeLogic = new MazeLogic(mazeLayout);
  
  // Generera frågor för hela labyrinten
  QuestionGenerator.generateQuestionsForMaze(mazeLogic, mazeLayout);
  
  // Skicka med mazeLogic till MazeRenderer
  const mazeRenderer = new MazeRenderer('maze-container', mazeLayout, mazeLogic);

  // Skapa UI
  const gameUI = new GameUI('maze-container', (answer: number, direction: string) => {
    const currentPos = mazeRenderer.getPlayer().getMazePosition();
    const questions = mazeLogic.getQuestionsAtPosition(currentPos);
    const questionForDirection = questions.find(q => q.direction === direction);

    if (questionForDirection && answer === questionForDirection.answer) {
      console.log('Rätt svar!');
      mazeRenderer.movePlayer(direction as Direction);
    } else {
      console.log('Fel svar!');
      mazeRenderer.resetPlayerPosition();
    }
  });

  // Uppdatera MazeRenderer för att känna till UI:n
  mazeRenderer.setUI(gameUI);
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    initWebGame();
  };
}
