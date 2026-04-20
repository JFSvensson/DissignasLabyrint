import { SoundManager } from './game/SoundManager';
import { i18n } from './services/TranslationService';
import { StartScreen } from './game/StartScreen';
import { GameConfig, LEVELS } from './game/GameConfig';
import { GameSession } from './game/GameSession';
import { showTimeUpScreen } from './game/TimeUpScreen';

const soundManager = new SoundManager();
const startScreen = new StartScreen();
let currentLevel = 1;
let activeSession: GameSession | null = null;

function fadeTransition(callback: () => void): void {
  const overlay = document.createElement('div');
  overlay.className = 'level-fade';
  document.body.appendChild(overlay);
  // Trigger reflow then fade in
  void overlay.offsetWidth;
  overlay.classList.add('level-fade--active');
  setTimeout(() => {
    callback();
    overlay.classList.remove('level-fade--active');
    setTimeout(() => overlay.remove(), 500);
  }, 500);
}

function clearContainers(): void {
  const maze = document.getElementById('maze-container');
  if (maze) maze.innerHTML = '';
  const ui = document.getElementById('ui-container');
  if (ui) ui.innerHTML = '';
}

export function showStartScreen(level?: number) {
  // Clean up any running timer
  const timer = activeSession?.getTimer();
  if (timer) { timer.stop(); }
  activeSession = null;

  clearContainers();

  startScreen.show((config) => {
    startGame(config, level);
  }, level, () => {
    // Level mode: start from level 1
    currentLevel = 1;
    const def = LEVELS[0];
    startGame({
      mazeSize: def.mazeSize,
      mathDifficulty: def.mathDifficulty,
      timerEnabled: def.timerSeconds > 0,
      timerSeconds: def.timerSeconds,
    }, currentLevel);
  });
}

function startGame(config: GameConfig, level?: number) {
  clearContainers();

  activeSession = new GameSession(config, soundManager, {
    onVictory: (_currentLevel, nextLevel) => {
      if (nextLevel !== undefined) {
        currentLevel = nextLevel;
        const def = LEVELS[Math.min(currentLevel - 1, LEVELS.length - 1)];
        fadeTransition(() => {
          startGame({
            mazeSize: def.mazeSize,
            mathDifficulty: def.mathDifficulty,
            timerEnabled: def.timerSeconds > 0,
            timerSeconds: def.timerSeconds,
          }, currentLevel);
        });
      }
    },
    onTimeUp: (onRetry, onMenu) => {
      showTimeUpScreen(onRetry, onMenu);
    },
    onRestart: (cfg, lvl) => {
      startGame(cfg, lvl);
    },
    onMenu: () => {
      const nextLevel = level !== undefined ? level + 1 : undefined;
      startScreen.remove();
      showStartScreen(nextLevel);
    },
  }, level);
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
