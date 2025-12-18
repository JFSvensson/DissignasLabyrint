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
  | 'ui.language.selectLanguage'
  // Math operations
  | 'math.operations.addition'
  | 'math.operations.subtraction'
  | 'math.operations.multiplication'
  | 'math.operations.division'
  // Game text
  | 'game.title'
  | 'game.welcome';

/**
 * Extend this type when adding new translation keys to ensure type safety
 */
export type ExtendedTranslationKey = TranslationKey | string;
