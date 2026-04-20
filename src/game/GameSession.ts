import { Direction } from './types';
import { MazeLogic } from './MazeLogic';
import { MazeGenerator } from './MazeGenerator';
import { MazeRenderer } from './MazeRenderer';
import { QuestionGenerator } from './QuestionGenerator';
import { GameUI } from './UI';
import { ScoreTracker } from './ScoreTracker';
import { GameTimer } from './GameTimer';
import { GameConfig, LEVELS } from './GameConfig';
import { PowerUpManager } from './PowerUpManager';
import { IAudioService } from '../interfaces/IAudioService';
import { i18n } from '../services/TranslationService';
import { stats } from './StatsManager';
import { ExplorationTracker } from './ExplorationTracker';
import { calcStarRating, calcExplorationBonus } from './StarRating';
import { getThemeForLevel } from './themes';

export interface GameSessionCallbacks {
  onVictory: (level: number | undefined, nextLevel: number | undefined) => void;
  onTimeUp: (onRetry: () => void, onMenu: () => void) => void;
  onRestart: (config: GameConfig, level?: number) => void;
  onMenu: () => void;
}

export class GameSession {
  private readonly mazeLogic: MazeLogic;
  private readonly scoreTracker: ScoreTracker;
  private readonly powerUpManager: PowerUpManager;
  private readonly mazeRenderer: MazeRenderer;
  private readonly gameUI: GameUI;
  private readonly config: GameConfig;
  private readonly level: number | undefined;
  private readonly soundManager: IAudioService;
  private readonly callbacks: GameSessionCallbacks;
  private readonly explorationTracker: ExplorationTracker;
  private timer: GameTimer | null = null;
  private atGoal: boolean = false;

  constructor(
    config: GameConfig,
    soundManager: IAudioService,
    callbacks: GameSessionCallbacks,
    level?: number
  ) {
    this.config = config;
    this.level = level;
    this.soundManager = soundManager;
    this.callbacks = callbacks;

    const mazeLayout = MazeGenerator.generate(config.mazeSize, config.mazeSize);
    this.mazeLogic = new MazeLogic(mazeLayout);
    this.scoreTracker = new ScoreTracker();
    this.powerUpManager = new PowerUpManager();
    this.explorationTracker = new ExplorationTracker(mazeLayout);

    this.powerUpManager.placePowerUps(mazeLayout, 3);

    const questionGenerator = new QuestionGenerator();
    questionGenerator.generateQuestionsForMaze(this.mazeLogic, mazeLayout, config.mathDifficulty);

    this.mazeRenderer = new MazeRenderer(
      'maze-container', mazeLayout, this.mazeLogic,
      level !== undefined ? getThemeForLevel(level) : undefined
    );
    this.mazeRenderer.addPowerUps(this.powerUpManager.getPowerUps());

    this.gameUI = new GameUI(
      'maze-container',
      (answer, direction) => this.handleAnswer(answer, direction),
      soundManager
    );

    if (config.timerEnabled && config.timerSeconds > 0) {
      this.timer = new GameTimer(config.timerSeconds, () => {
        callbacks.onTimeUp(
          () => callbacks.onRestart(config, level),
          () => callbacks.onMenu()
        );
      });
      this.gameUI.setTimer(this.timer);
      this.timer.start();
    }

    if (level !== undefined) {
      this.gameUI.setLevel(level);
    }

    this.mazeRenderer.setOnQuestionsUpdated((questions) => this.gameUI.updateQuestions(questions));
  }

  public getTimer(): GameTimer | null {
    return this.timer;
  }

  public getExplorationTracker(): ExplorationTracker {
    return this.explorationTracker;
  }

  private handleAnswer(answer: number, direction: Direction): void {
    const currentPos = this.mazeLogic.getPlayer().getMazePosition();
    const questions = this.mazeLogic.getQuestionsAtPosition(currentPos);
    const questionForDirection = questions.find(q => q.direction === direction);

    if (questionForDirection && answer === questionForDirection.answer) {
      this.handleCorrectAnswer(direction);
    } else {
      this.handleIncorrectAnswer();
    }
  }

  private handleCorrectAnswer(direction: Direction): void {
    const multiplier = this.powerUpManager.getScoreMultiplier();
    for (let i = 0; i < multiplier; i++) {
      this.scoreTracker.recordAnswer(true);
    }
    if (multiplier > 1) {
      this.powerUpManager.consumeMultiplierUse();
    }

    this.soundManager.playCorrect();
    this.gameUI.showFeedback(
      multiplier > 1
        ? `${i18n.t('ui.feedback.correct')} (x${multiplier}!)`
        : i18n.t('ui.feedback.correct'),
      'success'
    );
    this.gameUI.updateScore(
      this.scoreTracker.getScore(),
      this.scoreTracker.getAttempts(),
      this.scoreTracker.getStreak()
    );

    this.mazeLogic.movePlayer(direction);
    this.soundManager.playMove();

    const newPos = this.mazeLogic.getPlayer().getMazePosition();
    this.explorationTracker.markVisited(newPos);
    this.gameUI.updateExploration(
      this.explorationTracker.getVisitedCount(),
      this.explorationTracker.getTotalCells(),
      this.explorationTracker.getPercentage()
    );
    this.handlePowerUpCollection(newPos);

    const isAtGoal = this.mazeLogic.isGoalReached(newPos);
    if (isAtGoal && !this.atGoal) {
      this.atGoal = true;
      this.gameUI.showFinishButton(
        this.explorationTracker.getPercentage(),
        () => this.handleVictory()
      );
    } else if (!isAtGoal && this.atGoal) {
      this.atGoal = false;
      this.gameUI.hideFinishButton();
    }
  }

  private handleIncorrectAnswer(): void {
    this.scoreTracker.recordAnswer(false);
    this.soundManager.playIncorrect();
    this.gameUI.showFeedback(i18n.t('ui.feedback.incorrect'), 'error');
    this.gameUI.updateScore(
      this.scoreTracker.getScore(),
      this.scoreTracker.getAttempts(),
      this.scoreTracker.getStreak()
    );
    this.mazeLogic.resetPlayerPosition();
  }

  private handlePowerUpCollection(position: { x: number; z: number }): void {
    const collected = this.powerUpManager.collectAtPosition(position);
    if (!collected) return;

    this.mazeRenderer.removePowerUpAt(position.x, position.z);
    this.soundManager.playCorrect();

    // Particle burst matching power-up color
    const burstColors: Record<string, number> = {
      hint: 0x00ccff,
      timeBonus: 0x00ff88,
      scoreMultiplier: 0xffaa00,
    };
    this.mazeRenderer.emitPowerUpBurst(
      position.x, position.z,
      burstColors[collected.type] ?? 0xffffff
    );

    if (collected.type === 'hint') {
      const allQ = this.mazeLogic.getQuestionsAtPosition(position);
      const hint = this.powerUpManager.getHintAnswer(allQ);
      if (hint) {
        this.gameUI.showFeedback(
          `${i18n.t('ui.powerUp.hint')}: ${hint.direction} = ${hint.answer}`,
          'success'
        );
      }
    } else if (collected.type === 'timeBonus' && this.timer) {
      this.timer.addTime(30);
      this.gameUI.showFeedback(i18n.t('ui.powerUp.timeBonus'), 'success');
    } else if (collected.type === 'scoreMultiplier') {
      this.gameUI.showFeedback(i18n.t('ui.powerUp.scoreMultiplier'), 'success');
    }
  }

  private handleVictory(): void {
    if (this.timer) { this.timer.stop(); }
    this.gameUI.hideFinishButton();
    this.soundManager.playVictory();

    // Victory confetti at player position
    const pos = this.mazeLogic.getPlayer().getMazePosition();
    this.mazeRenderer.emitVictoryConfetti(pos.x, pos.z);

    // Exploration bonus
    const explorationPct = this.explorationTracker.getPercentage();
    const explorationBonus = calcExplorationBonus(this.scoreTracker.getScore(), explorationPct);
    this.scoreTracker.addExplorationBonus(explorationBonus);

    // Star rating
    const starCount = calcStarRating(explorationPct, this.scoreTracker.getAccuracy());

    const timeRemaining = this.timer ? this.timer.getRemainingSeconds() : undefined;
    const isNewHighScore = stats.saveGameResult({
      level: this.level ?? 0,
      score: this.scoreTracker.getScore(),
      accuracy: this.scoreTracker.getAccuracy(),
      bestStreak: this.scoreTracker.getBestStreak(),
      mazeSize: this.config.mazeSize,
      difficulty: this.config.mathDifficulty,
      timeRemaining,
      starCount,
      date: new Date().toISOString(),
    });

    stats.saveBestStars(this.level ?? 0, starCount);

    const nextLevel = this.level !== undefined ? this.level + 1 : undefined;
    const hasNextLevel = nextLevel !== undefined && nextLevel <= LEVELS.length;

    setTimeout(() => {
      this.gameUI.showVictoryScreen(
        this.scoreTracker.getScore(),
        this.scoreTracker.getAttempts(),
        this.scoreTracker.getAccuracy(),
        this.scoreTracker.getBestStreak(),
        () => {
          this.callbacks.onMenu();
        },
        timeRemaining,
        hasNextLevel ? () => {
          this.callbacks.onVictory(this.level, nextLevel);
        } : undefined,
        isNewHighScore,
        explorationPct,
        explorationBonus,
        starCount
      );
    }, 500);
  }

}
