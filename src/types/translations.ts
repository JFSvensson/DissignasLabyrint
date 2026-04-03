/**
 * Type-safe translation keys for the application.
 * These types ensure that only valid translation keys can be used with the i18n service.
 */

export type TranslationKey =
  // UI translations
  | 'ui.answerLabel'
  | 'ui.directions.north'
  | 'ui.directions.south'
  | 'ui.directions.east'
  | 'ui.directions.west'
  | 'ui.validation.invalidNumber'
  | 'ui.feedback.correct'
  | 'ui.feedback.incorrect'
  | 'ui.feedback.tryAgain'
  | 'ui.language.swedish'
  | 'ui.language.english'
  | 'ui.language.norwegian'
  | 'ui.language.finnish'
  | 'ui.language.danish'
  | 'ui.language.selectLanguage'
  | 'ui.victory.title'
  | 'ui.victory.message'
  | 'ui.victory.score'
  | 'ui.victory.attempts'
  | 'ui.victory.accuracy'
  | 'ui.victory.bestStreak'
  | 'ui.victory.playAgain'
  | 'ui.victory.timeRemaining'
  | 'ui.victory.newHighScore'
  | 'ui.victory.share'
  | 'ui.victory.copied'
  | 'ui.score.label'
  | 'ui.score.attempts'
  | 'ui.score.streak'
  | 'ui.sound.on'
  | 'ui.sound.off'
  // Settings
  | 'ui.settings.mazeSize'
  | 'ui.settings.mathDifficulty'
  | 'ui.settings.easy'
  | 'ui.settings.medium'
  | 'ui.settings.hard'
  | 'ui.settings.timer'
  | 'ui.settings.timerOff'
  | 'ui.settings.start'
  | 'ui.settings.startLevel'
  // Level
  | 'ui.level.label'
  | 'ui.level.complete'
  // Tutorial
  | 'ui.tutorial.howToPlay'
  | 'ui.tutorial.title'
  | 'ui.tutorial.step1'
  | 'ui.tutorial.step2'
  | 'ui.tutorial.step3'
  | 'ui.tutorial.step4'
  | 'ui.tutorial.step5'
  | 'ui.tutorial.tip'
  | 'ui.tutorial.close'
  // Time up
  | 'ui.timeUp.title'
  | 'ui.timeUp.message'
  | 'ui.timeUp.tryAgain'
  | 'ui.timeUp.backToMenu'
  // Music
  | 'ui.music.on'
  | 'ui.music.off'
  // Power-ups
  | 'ui.powerUp.hint'
  | 'ui.powerUp.timeBonus'
  | 'ui.powerUp.scoreMultiplier'
  // ARIA
  | 'ui.aria.gameControls'
  | 'ui.aria.directionButtons'
  // Math operations
  | 'math.operations.addition'
  | 'math.operations.subtraction'
  | 'math.operations.multiplication'
  | 'math.operations.division'
  | 'math.operations.modulo'
  | 'math.operations.power'
  // Game text
  | 'game.title'
  | 'game.welcome'
  | 'game.timeUp'
  | 'game.nextLevel'
  // Highscore & stats
  | 'ui.highscore.title'
  | 'ui.highscore.empty'
  | 'ui.highscore.level'
  | 'ui.highscore.date'
  | 'ui.stats.gamesWon'
  | 'ui.stats.highestLevel';

/**
 * Extend this type when adding new translation keys to ensure type safety
 */
export type ExtendedTranslationKey = TranslationKey | string;
