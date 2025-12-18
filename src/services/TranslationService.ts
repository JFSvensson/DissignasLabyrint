import { locales, SupportedLocale, supportedLocales, defaultLocale } from '../locales';

/**
 * TranslationService handles internationalization (i18n) for the game.
 * Provides translation lookup, locale switching, and persistence.
 */
class TranslationService {
  private static instance: TranslationService;
  private currentLocale: SupportedLocale;
  private translations: Record<string, any>;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.currentLocale = this.detectLocale();
    this.translations = locales[this.currentLocale];
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Detect the user's preferred locale from browser or localStorage
   */
  private detectLocale(): SupportedLocale {
    // Check localStorage first
    const savedLocale = localStorage.getItem('preferredLanguage') as SupportedLocale;
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }

    // Detect from browser
    const browserLang = navigator.language.split('-')[0];
    if (supportedLocales.includes(browserLang as SupportedLocale)) {
      return browserLang as SupportedLocale;
    }

    // Fallback to default
    return defaultLocale;
  }

  /**
   * Get a translation by key (supports nested keys like "ui.answerLabel")
   */
  public t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key itself if translation is missing
      }
    }

    if (typeof value === 'string') {
      return value;
    }

    console.warn(`Translation key "${key}" does not resolve to a string`);
    return key;
  }

  /**
   * Change the current locale
   */
  public setLocale(locale: SupportedLocale): void {
    if (!supportedLocales.includes(locale)) {
      console.error(`Unsupported locale: ${locale}`);
      return;
    }

    this.currentLocale = locale;
    this.translations = locales[locale];
    
    // Persist to localStorage
    localStorage.setItem('preferredLanguage', locale);

    // Update HTML lang attribute
    document.documentElement.lang = locale;

    // Update document title
    document.title = this.t('game.title');

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Get the current locale
   */
  public getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  /**
   * Get all supported locales
   */
  public getSupportedLocales(): SupportedLocale[] {
    return [...supportedLocales];
  }

  /**
   * Register a callback to be called when locale changes
   */
  public onChange(callback: () => void): void {
    this.listeners.add(callback);
  }

  /**
   * Unregister a callback
   */
  public offChange(callback: () => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of locale change
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }
}

// Export singleton instance
export const i18n = TranslationService.getInstance();
