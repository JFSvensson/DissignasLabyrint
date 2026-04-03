import { MazeRenderer } from './game/MazeRenderer';
import { MazeLogic } from './game/MazeLogic';
import { MazeGenerator } from './game/MazeGenerator';
import { Direction } from './game/types';
import { QuestionGenerator } from './game/QuestionGenerator';
import { GameUI } from './game/UI';
import { ScoreTracker } from './game/ScoreTracker';
import { SoundManager } from './game/SoundManager';
import { i18n } from './services/TranslationService';
import { StartScreen } from './game/StartScreen';
import { GameConfig, LEVELS } from './game/GameConfig';
import { GameTimer } from './game/GameTimer';
import { stats } from './game/StatsManager';
import { PowerUpManager } from './game/PowerUpManager';

const soundManager = new SoundManager();
const startScreen = new StartScreen();
let currentLevel = 1;
let activeTimer: GameTimer | null = null;

export function showStartScreen(level?: number) {
  // Clean up any running timer
  if (activeTimer) { activeTimer.stop(); activeTimer = null; }

  const container = document.getElementById('maze-container');
  if (container) container.innerHTML = '';
  const uiContainer = document.getElementById('ui-container');
  if (uiContainer) uiContainer.innerHTML = '';

  startScreen.show((config) => {
    startGame(config, level);
  }, level);
}

function startGame(config: GameConfig, level?: number) {
  // Clean containers
  const mazeContainer = document.getElementById('maze-container');
  if (mazeContainer) mazeContainer.innerHTML = '';
  const uiContainer = document.getElementById('ui-container');
  if (uiContainer) uiContainer.innerHTML = '';

  const mazeLayout = MazeGenerator.generate(config.mazeSize, config.mazeSize);
  const mazeLogic = new MazeLogic(mazeLayout);
  const scoreTracker = new ScoreTracker();
  const powerUpManager = new PowerUpManager();

  // Place 3 power-ups in the maze
  powerUpManager.placePowerUps(mazeLayout, 3);

  QuestionGenerator.generateQuestionsForMaze(mazeLogic, mazeLayout, config.mathDifficulty);

  const mazeRenderer = new MazeRenderer('maze-container', mazeLayout, mazeLogic);

  // Render power-ups in 3D
  mazeRenderer.addPowerUps(powerUpManager.getPowerUps());

  const gameUI = new GameUI('maze-container', (answer: number, direction: Direction) => {
    const currentPos = mazeLogic.getPlayer().getMazePosition();
    const questions = mazeLogic.getQuestionsAtPosition(currentPos);
    const questionForDirection = questions.find(q => q.direction === direction);

    if (questionForDirection && answer === questionForDirection.answer) {
      // Apply score multiplier from power-up
      const multiplier = powerUpManager.getScoreMultiplier();
      for (let i = 0; i < multiplier; i++) {
        scoreTracker.recordAnswer(true);
      }
      if (multiplier > 1) {
        powerUpManager.consumeMultiplierUse();
      }
      soundManager.playCorrect();
      gameUI.showFeedback(
        multiplier > 1
          ? `${i18n.t('ui.feedback.correct')} (x${multiplier}!)`
          : i18n.t('ui.feedback.correct'),
        'success'
      );
      gameUI.updateScore(scoreTracker.getScore(), scoreTracker.getAttempts(), scoreTracker.getStreak());

      mazeLogic.movePlayer(direction);
      soundManager.playMove();

      const newPos = mazeLogic.getPlayer().getMazePosition();

      // Check for power-up collection
      const collected = powerUpManager.collectAtPosition(newPos);
      if (collected) {
        mazeRenderer.removePowerUpAt(newPos.x, newPos.z);
        soundManager.playCorrect();
        if (collected.type === 'hint') {
          const allQ = mazeLogic.getQuestionsAtPosition(newPos);
          const hint = powerUpManager.getHintAnswer(allQ);
          if (hint) {
            gameUI.showFeedback(
              `${i18n.t('ui.powerUp.hint')}: ${hint.direction} = ${hint.answer}`,
              'success'
            );
          }
        } else if (collected.type === 'timeBonus' && activeTimer) {
          activeTimer.addTime(30);
          gameUI.showFeedback(i18n.t('ui.powerUp.timeBonus'), 'success');
        } else if (collected.type === 'scoreMultiplier') {
          gameUI.showFeedback(i18n.t('ui.powerUp.scoreMultiplier'), 'success');
        }
      }

      if (mazeLogic.isGoalReached(newPos)) {
        if (activeTimer) { activeTimer.stop(); }
        soundManager.playVictory();
        const timeRemaining = activeTimer ? activeTimer.getRemainingSeconds() : undefined;
        const isNewHighScore = stats.saveGameResult({
          level: level ?? 0,
          score: scoreTracker.getScore(),
          accuracy: scoreTracker.getAccuracy(),
          bestStreak: scoreTracker.getBestStreak(),
          mazeSize: config.mazeSize,
          difficulty: config.mathDifficulty,
          timeRemaining,
          date: new Date().toISOString(),
        });
        setTimeout(() => {
          const nextLevel = level !== undefined ? level + 1 : undefined;
          gameUI.showVictoryScreen(
            scoreTracker.getScore(),
            scoreTracker.getAttempts(),
            scoreTracker.getAccuracy(),
            scoreTracker.getBestStreak(),
            () => {
              // Play again at same settings
              startScreen.remove();
              showStartScreen(nextLevel);
            },
            timeRemaining,
            nextLevel !== undefined && nextLevel <= LEVELS.length ? () => {
              currentLevel = nextLevel!;
              const def = LEVELS[Math.min(currentLevel - 1, LEVELS.length - 1)];
              startGame({
                mazeSize: def.mazeSize,
                mathDifficulty: def.mathDifficulty,
                timerEnabled: def.timerSeconds > 0,
                timerSeconds: def.timerSeconds,
              }, currentLevel);
            } : undefined,
            isNewHighScore
          );
        }, 500);
      }
    } else {
      scoreTracker.recordAnswer(false);
      soundManager.playIncorrect();
      gameUI.showFeedback(i18n.t('ui.feedback.incorrect'), 'error');
      gameUI.updateScore(scoreTracker.getScore(), scoreTracker.getAttempts(), scoreTracker.getStreak());
      mazeLogic.resetPlayerPosition();
    }
  }, soundManager);

  // Timer
  if (config.timerEnabled && config.timerSeconds > 0) {
    activeTimer = new GameTimer(config.timerSeconds, () => {
      // Time's up — show time-up overlay
      showTimeUpScreen(() => {
        startGame(config, level);
      }, () => {
        showStartScreen();
      });
    });
    gameUI.setTimer(activeTimer);
    activeTimer.start();
  }

  // Level indicator
  if (level !== undefined) {
    gameUI.setLevel(level);
  }

  mazeRenderer.setUI(gameUI);
}

function showTimeUpScreen(onRetry: () => void, onMenu: () => void) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex; justify-content: center;
    align-items: center; z-index: 1000; font-family: Arial, sans-serif;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: linear-gradient(135deg, #8b0000, #4a0000); padding: 40px;
    border-radius: 20px; text-align: center; color: white; max-width: 400px;
  `;

  const title = document.createElement('h1');
  title.textContent = `⏱ ${i18n.t('ui.timeUp.title')}`;
  title.style.cssText = `font-size: 36px; margin: 0 0 15px 0;`;
  box.appendChild(title);

  const msg = document.createElement('p');
  msg.textContent = i18n.t('ui.timeUp.message');
  msg.style.cssText = `font-size: 16px; margin: 0 0 25px 0; color: #ccc;`;
  box.appendChild(msg);

  [
    { text: i18n.t('ui.timeUp.tryAgain'), action: onRetry, bg: '#4CAF50' },
    { text: i18n.t('ui.timeUp.backToMenu'), action: onMenu, bg: 'rgba(255,255,255,0.15)' },
  ].forEach(({ text, action, bg }) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      display: block; width: 100%; margin: 8px 0; padding: 12px; background: ${bg};
      color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;
    `;
    btn.onclick = () => { overlay.parentNode?.removeChild(overlay); action(); };
    box.appendChild(btn);
  });

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

export function initWebGame() {
  document.documentElement.lang = i18n.getLocale();
  document.title = i18n.t('game.title');
  currentLevel = 1;
  showStartScreen();
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    initWebGame();

    // Register service worker for PWA / offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  };
}
