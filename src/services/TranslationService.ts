import { locales, SupportedLocale, supportedLocales, defaultLocale } from '../locales';

export interface TranslationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface TranslationDocument {
  documentElement: { lang: string };
  title: string;
}

export interface TranslationEnvironment {
  storage: TranslationStorage;
  language: string;
  document: TranslationDocument;
}

function createBrowserEnvironment(): TranslationEnvironment {
  return {
    storage: globalThis.localStorage,
    language: globalThis.navigator.language,
    document: globalThis.document,
  };
}

/**
 * TranslationService handles internationalization (i18n) for the game.
 * Provides translation lookup, locale switching, and persistence.
 */
export class TranslationService {
  private static instance: TranslationService;
  private currentLocale: SupportedLocale;
  private translations: Record<string, unknown>;
  private listeners: Set<() => void> = new Set();

  private readonly environment: TranslationEnvironment;

  constructor(environment: TranslationEnvironment = createBrowserEnvironment()) {
    this.environment = environment;
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
    const savedLocale = this.environment.storage.getItem('preferredLanguage') as SupportedLocale;
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }

    // Detect from browser
    const browserLang = this.environment.language.split('-')[0];
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
    let value: unknown = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
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
    this.environment.storage.setItem('preferredLanguage', locale);

    // Update HTML lang attribute
    this.environment.document.documentElement.lang = locale;

    // Update document title
    this.environment.document.title = this.t('game.title');

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
    [...this.listeners].forEach(callback => callback());
  }
}

// Export singleton instance
export const i18n = TranslationService.getInstance();
