import { MazeRenderer } from './game/MazeRenderer';
import { MazeLogic } from './game/MazeLogic';
import { Direction } from './game/types';
import { QuestionGenerator } from './game/QuestionGenerator';
import { GameUI } from './game/UI';
import { i18n } from './services/TranslationService';

export function initWebGame() {
  // Set initial HTML lang attribute
  document.documentElement.lang = i18n.getLocale();
  document.title = i18n.t('game.title');

  const mazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
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
      console.log(i18n.t('ui.feedback.correct'));
      mazeRenderer.movePlayer(direction as Direction);
    } else {
      console.log(i18n.t('ui.feedback.incorrect'));
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
