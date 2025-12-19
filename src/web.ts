import { MazeRenderer } from './game/MazeRenderer';
import { MazeLogic } from './game/MazeLogic';
import { Direction } from './game/types';
import { QuestionGenerator } from './game/QuestionGenerator';
import { GameUI } from './game/UI';
import { ScoreTracker } from './game/ScoreTracker';
import { i18n } from './services/TranslationService';

export function initWebGame() {
  // Set initial HTML lang attribute
  document.documentElement.lang = i18n.getLocale();
  document.title = i18n.t('game.title');

  const startGame = () => {
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
    const scoreTracker = new ScoreTracker();
    
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
        // Correct answer
        scoreTracker.recordAnswer(true);
        gameUI.showFeedback(i18n.t('ui.feedback.correct'), 'success');
        gameUI.updateScore(scoreTracker.getScore(), scoreTracker.getAttempts());
        
        mazeRenderer.movePlayer(direction as Direction);
        
        // Check for win condition after move
        const newPos = mazeRenderer.getPlayer().getMazePosition();
        if (mazeLogic.isGoalReached(newPos)) {
          setTimeout(() => {
            gameUI.showVictoryScreen(
              scoreTracker.getScore(),
              scoreTracker.getAttempts(),
              () => {
                // Reset and start new game
                const container = document.getElementById('maze-container');
                if (container) {
                  container.innerHTML = '';
                }
                initWebGame();
              }
            );
          }, 500); // Delay to let player see they reached goal
        }
      } else {
        // Incorrect answer
        scoreTracker.recordAnswer(false);
        gameUI.showFeedback(i18n.t('ui.feedback.incorrect'), 'error');
        gameUI.updateScore(scoreTracker.getScore(), scoreTracker.getAttempts());
        mazeRenderer.resetPlayerPosition();
      }
    });

    // Uppdatera MazeRenderer för att känna till UI:n
    mazeRenderer.setUI(gameUI);
  };

  startGame();
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    initWebGame();
  };
}
