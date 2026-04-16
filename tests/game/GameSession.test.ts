/**
 * @jest-environment jsdom
 */
import { GameSession, GameSessionCallbacks } from '../../src/game/GameSession';
import { GameConfig } from '../../src/game/GameConfig';
import { IAudioService } from '../../src/interfaces/IAudioService';

// --- Mock all heavy dependencies ---

const mockMazeLayout = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
];

jest.mock('../../src/game/MazeGenerator', () => ({
  MazeGenerator: {
    generate: jest.fn(() => mockMazeLayout),
  },
}));

const mockPlayer = {
  getMazePosition: jest.fn(() => ({ x: 1, z: 1 })),
  getMesh: jest.fn(() => ({})),
  setMazePosition: jest.fn(),
};

const mockMazeLogic = {
  getPlayer: jest.fn(() => mockPlayer),
  getGoalPosition: jest.fn(() => ({ x: 3, z: 3 })),
  getAvailableDirections: jest.fn(() => ['EAST', 'SOUTH']),
  getQuestionsAtPosition: jest.fn(() => [
    { direction: 'EAST', question: '2+2', answer: 4 },
    { direction: 'SOUTH', question: '3+1', answer: 4 },
  ]),
  isGoalReached: jest.fn(() => false),
  movePlayer: jest.fn(),
  resetPlayerPosition: jest.fn(),
  updateAvailableDirections: jest.fn(),
  setQuestionForDirection: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
};

jest.mock('../../src/game/MazeLogic', () => ({
  MazeLogic: jest.fn(() => mockMazeLogic),
}));

jest.mock('../../src/game/QuestionGenerator', () => ({
  QuestionGenerator: jest.fn(() => ({
    generateQuestionsForMaze: jest.fn(),
  })),
}));

const mockMazeRenderer = {
  addPowerUps: jest.fn(),
  removePowerUpAt: jest.fn(),
  emitPowerUpBurst: jest.fn(),
  emitVictoryConfetti: jest.fn(),
  setOnQuestionsUpdated: jest.fn(),
  dispose: jest.fn(),
};

jest.mock('../../src/game/MazeRenderer', () => ({
  MazeRenderer: jest.fn(() => mockMazeRenderer),
}));

const mockGameUI = {
  showFeedback: jest.fn(),
  updateScore: jest.fn(),
  updateQuestions: jest.fn(),
  setTimer: jest.fn(),
  setLevel: jest.fn(),
  showVictoryScreen: jest.fn(),
  dispose: jest.fn(),
};

jest.mock('../../src/game/UI', () => ({
  GameUI: jest.fn((_, onAnswer) => {
    mockOnAnswer = onAnswer;
    return mockGameUI;
  }),
}));

const mockTimerInstance = {
  start: jest.fn(),
  stop: jest.fn(),
  getElement: jest.fn(() => document.createElement('div')),
  getRemainingSeconds: jest.fn(() => 100),
  addTime: jest.fn(),
};

jest.mock('../../src/game/GameTimer', () => ({
  GameTimer: jest.fn((_, onTimeUp) => {
    mockOnTimeUp = onTimeUp;
    return mockTimerInstance;
  }),
}));

const mockPowerUpManager = {
  placePowerUps: jest.fn(),
  getPowerUps: jest.fn(() => []),
  getUncollectedPowerUps: jest.fn(() => []),
  collectAtPosition: jest.fn() as jest.Mock,
  getScoreMultiplier: jest.fn(() => 1),
  consumeMultiplierUse: jest.fn(),
  getActiveMultiplier: jest.fn() as jest.Mock,
  getHintAnswer: jest.fn() as jest.Mock,
};

jest.mock('../../src/game/PowerUpManager', () => ({
  PowerUpManager: jest.fn(() => mockPowerUpManager),
}));

jest.mock('../../src/game/ScoreTracker', () => ({
  ScoreTracker: jest.fn(() => mockScoreTracker),
}));

const mockScoreTracker = {
  recordAnswer: jest.fn(),
  getScore: jest.fn(() => 0),
  getAttempts: jest.fn(() => 0),
  getCorrectAnswers: jest.fn(() => 0),
  getIncorrectAnswers: jest.fn(() => 0),
  getStreak: jest.fn(() => 0),
  getBestStreak: jest.fn(() => 0),
  getAccuracy: jest.fn(() => 0),
  reset: jest.fn(),
};

jest.mock('../../src/services/TranslationService', () => ({
  i18n: {
    t: jest.fn((key: string) => key),
    getLocale: jest.fn(() => 'sv'),
    setLocale: jest.fn(),
    getSupportedLocales: jest.fn(() => ['sv', 'en']),
    onChange: jest.fn(),
    offChange: jest.fn(),
  },
}));

jest.mock('../../src/game/StatsManager', () => ({
  stats: {
    saveGameResult: jest.fn(() => false),
    getStats: jest.fn(() => ({ highScores: [], highestLevel: 1, totalGamesPlayed: 0, totalGamesWon: 0 })),
    getHighScores: jest.fn(() => []),
  },
}));

// Capture the onAnswer callback injected into GameUI
let mockOnAnswer: (answer: number, direction: string) => void;
// Capture the onTimeUp callback injected into GameTimer
let mockOnTimeUp: () => void;

// --- Helpers ---

function createSoundManager(): IAudioService {
  return {
    setEnabled: jest.fn(),
    isEnabled: jest.fn(() => true),
    playCorrect: jest.fn(),
    playIncorrect: jest.fn(),
    playVictory: jest.fn(),
    playMove: jest.fn(),
    startMusic: jest.fn(),
    stopMusic: jest.fn(),
    toggleMusic: jest.fn(),
    isMusicPlaying: jest.fn(() => false),
  };
}

function createCallbacks(): GameSessionCallbacks {
  return {
    onVictory: jest.fn(),
    onTimeUp: jest.fn(),
    onRestart: jest.fn(),
    onMenu: jest.fn(),
  };
}

const baseConfig: GameConfig = {
  mazeSize: 5,
  mathDifficulty: 'medium',
  timerEnabled: false,
  timerSeconds: 0,
};

const timerConfig: GameConfig = {
  mazeSize: 5,
  mathDifficulty: 'medium',
  timerEnabled: true,
  timerSeconds: 120,
};

// --- Tests ---

describe('GameSession', () => {
  let soundManager: IAudioService;
  let callbacks: GameSessionCallbacks;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    soundManager = createSoundManager();
    callbacks = createCallbacks();
    document.body.innerHTML = '<div id="maze-container"></div><div id="ui-container"></div>';
    // Reset player position for each test
    mockPlayer.getMazePosition.mockReturnValue({ x: 1, z: 1 });
    mockMazeLogic.isGoalReached.mockReturnValue(false);
    mockPowerUpManager.collectAtPosition.mockReturnValue(null);
    mockPowerUpManager.getHintAnswer.mockReturnValue(null);
    mockPowerUpManager.getActiveMultiplier.mockReturnValue(null);
    mockPowerUpManager.getScoreMultiplier.mockReturnValue(1);
    mockScoreTracker.getScore.mockReturnValue(0);
    mockScoreTracker.getAttempts.mockReturnValue(0);
    mockScoreTracker.getStreak.mockReturnValue(0);
    mockScoreTracker.getAccuracy.mockReturnValue(0);
    mockScoreTracker.getBestStreak.mockReturnValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('construction', () => {
    it('should create session without timer', () => {
      const session = new GameSession(baseConfig, soundManager, callbacks);
      expect(session.getTimer()).toBeNull();
      expect(mockGameUI.setTimer).not.toHaveBeenCalled();
    });

    it('should create session with timer when enabled', () => {
      const session = new GameSession(timerConfig, soundManager, callbacks);
      expect(session.getTimer()).toBe(mockTimerInstance);
      expect(mockGameUI.setTimer).toHaveBeenCalledWith(mockTimerInstance);
      expect(mockTimerInstance.start).toHaveBeenCalled();
    });

    it('should set level on UI when level is provided', () => {
      new GameSession(baseConfig, soundManager, callbacks, 3);
      expect(mockGameUI.setLevel).toHaveBeenCalledWith(3);
    });

    it('should not set level on UI when no level provided', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      expect(mockGameUI.setLevel).not.toHaveBeenCalled();
    });

    it('should add power-ups to renderer', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      expect(mockPowerUpManager.placePowerUps).toHaveBeenCalled();
      expect(mockMazeRenderer.addPowerUps).toHaveBeenCalled();
    });

    it('should wire up questions updated callback', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      expect(mockMazeRenderer.setOnQuestionsUpdated).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('correct answer', () => {
    it('should record correct answer and update UI', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockScoreTracker.getScore.mockReturnValue(10);
      mockScoreTracker.getAttempts.mockReturnValue(1);
      mockScoreTracker.getStreak.mockReturnValue(1);

      mockOnAnswer(4, 'EAST');

      expect(mockScoreTracker.recordAnswer).toHaveBeenCalledWith(true);
      expect(soundManager.playCorrect).toHaveBeenCalled();
      expect(mockGameUI.showFeedback).toHaveBeenCalledWith('ui.feedback.correct', 'success');
      expect(mockGameUI.updateScore).toHaveBeenCalledWith(10, 1, 1);
    });

    it('should move player in correct direction', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockOnAnswer(4, 'EAST');

      expect(mockMazeLogic.movePlayer).toHaveBeenCalledWith('EAST');
      expect(soundManager.playMove).toHaveBeenCalled();
    });

    it('should apply score multiplier when active', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockPowerUpManager.getScoreMultiplier.mockReturnValue(2);

      mockOnAnswer(4, 'EAST');

      expect(mockScoreTracker.recordAnswer).toHaveBeenCalledTimes(2);
      expect(mockPowerUpManager.consumeMultiplierUse).toHaveBeenCalled();
      expect(mockGameUI.showFeedback).toHaveBeenCalledWith(
        expect.stringContaining('x2'),
        'success'
      );
    });
  });

  describe('incorrect answer', () => {
    it('should record incorrect answer and show error feedback', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockOnAnswer(999, 'EAST');

      expect(mockScoreTracker.recordAnswer).toHaveBeenCalledWith(false);
      expect(soundManager.playIncorrect).toHaveBeenCalled();
      expect(mockGameUI.showFeedback).toHaveBeenCalledWith('ui.feedback.incorrect', 'error');
    });

    it('should reset player position on wrong answer', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockOnAnswer(999, 'EAST');

      expect(mockMazeLogic.resetPlayerPosition).toHaveBeenCalled();
      expect(mockMazeLogic.movePlayer).not.toHaveBeenCalled();
    });
  });

  describe('power-up collection', () => {
    it('should collect hint and show hint feedback', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockPowerUpManager.collectAtPosition.mockReturnValue({
        type: 'hint',
        position: { x: 2, z: 1 },
        collected: true,
      });
      mockPowerUpManager.getHintAnswer.mockReturnValue({ direction: 'SOUTH', answer: 7 });
      mockPlayer.getMazePosition.mockReturnValue({ x: 2, z: 1 });

      mockOnAnswer(4, 'EAST');

      expect(mockMazeRenderer.removePowerUpAt).toHaveBeenCalledWith(2, 1);
      expect(mockMazeRenderer.emitPowerUpBurst).toHaveBeenCalledWith(2, 1, 0x00ccff);
      expect(mockGameUI.showFeedback).toHaveBeenCalledWith(
        expect.stringContaining('SOUTH = 7'),
        'success'
      );
    });

    it('should collect timeBonus and add time', () => {
      new GameSession(timerConfig, soundManager, callbacks);
      mockPowerUpManager.collectAtPosition.mockReturnValue({
        type: 'timeBonus',
        position: { x: 2, z: 1 },
        collected: true,
      });
      mockPlayer.getMazePosition.mockReturnValue({ x: 2, z: 1 });

      mockOnAnswer(4, 'EAST');

      expect(mockTimerInstance.addTime).toHaveBeenCalledWith(30);
      expect(mockMazeRenderer.emitPowerUpBurst).toHaveBeenCalledWith(2, 1, 0x00ff88);
    });

    it('should collect scoreMultiplier and show feedback', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockPowerUpManager.collectAtPosition.mockReturnValue({
        type: 'scoreMultiplier',
        position: { x: 2, z: 1 },
        collected: true,
      });
      mockPlayer.getMazePosition.mockReturnValue({ x: 2, z: 1 });

      mockOnAnswer(4, 'EAST');

      expect(mockMazeRenderer.emitPowerUpBurst).toHaveBeenCalledWith(2, 1, 0xffaa00);
      expect(mockGameUI.showFeedback).toHaveBeenCalledWith('ui.powerUp.scoreMultiplier', 'success');
    });

    it('should not add time for timeBonus without timer', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockPowerUpManager.collectAtPosition.mockReturnValue({
        type: 'timeBonus',
        position: { x: 2, z: 1 },
        collected: true,
      });
      mockPlayer.getMazePosition.mockReturnValue({ x: 2, z: 1 });

      mockOnAnswer(4, 'EAST');

      expect(mockTimerInstance.addTime).not.toHaveBeenCalled();
    });
  });

  describe('victory', () => {
    it('should trigger victory when goal reached', () => {
      const { stats } = jest.requireMock('../../src/game/StatsManager');
      new GameSession(baseConfig, soundManager, callbacks, 2);
      mockMazeLogic.isGoalReached.mockReturnValue(true);
      mockScoreTracker.getScore.mockReturnValue(50);
      mockScoreTracker.getAccuracy.mockReturnValue(80);
      mockScoreTracker.getBestStreak.mockReturnValue(3);

      mockOnAnswer(4, 'EAST');

      expect(soundManager.playVictory).toHaveBeenCalled();
      expect(mockMazeRenderer.emitVictoryConfetti).toHaveBeenCalledWith(1, 1);
      expect(stats.saveGameResult).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 2,
          score: 50,
          accuracy: 80,
          bestStreak: 3,
          mazeSize: 5,
          difficulty: 'medium',
        })
      );
    });

    it('should show victory screen after delay', () => {
      new GameSession(baseConfig, soundManager, callbacks, 1);
      mockMazeLogic.isGoalReached.mockReturnValue(true);

      mockOnAnswer(4, 'EAST');
      expect(mockGameUI.showVictoryScreen).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockGameUI.showVictoryScreen).toHaveBeenCalled();
    });

    it('should stop timer on victory', () => {
      new GameSession(timerConfig, soundManager, callbacks, 1);
      mockMazeLogic.isGoalReached.mockReturnValue(true);

      mockOnAnswer(4, 'EAST');

      expect(mockTimerInstance.stop).toHaveBeenCalled();
    });

    it('should offer next level when within LEVELS range', () => {
      new GameSession(baseConfig, soundManager, callbacks, 1);
      mockMazeLogic.isGoalReached.mockReturnValue(true);

      mockOnAnswer(4, 'EAST');
      jest.advanceTimersByTime(500);

      // showVictoryScreen's 7th arg is onNextLevel callback (not undefined)
      const call = mockGameUI.showVictoryScreen.mock.calls[0];
      expect(call[6]).toBeInstanceOf(Function); // onNextLevel exists
    });

    it('should not offer next level when no level provided', () => {
      new GameSession(baseConfig, soundManager, callbacks);
      mockMazeLogic.isGoalReached.mockReturnValue(true);

      mockOnAnswer(4, 'EAST');
      jest.advanceTimersByTime(500);

      const call = mockGameUI.showVictoryScreen.mock.calls[0];
      expect(call[6]).toBeUndefined(); // no onNextLevel
    });
  });

  describe('timer', () => {
    it('should call onTimeUp when timer expires', () => {
      new GameSession(timerConfig, soundManager, callbacks, 1);

      // Trigger the onTimeUp callback captured from GameTimer constructor
      mockOnTimeUp();

      expect(callbacks.onTimeUp).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should provide retry and menu callbacks to onTimeUp', () => {
      new GameSession(timerConfig, soundManager, callbacks, 1);
      mockOnTimeUp();

      const [onRetry, onMenu] = (callbacks.onTimeUp as jest.Mock).mock.calls[0];
      onRetry();
      expect(callbacks.onRestart).toHaveBeenCalledWith(timerConfig, 1);

      onMenu();
      expect(callbacks.onMenu).toHaveBeenCalled();
    });
  });
});
