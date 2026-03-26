/**
 * Tests for TranslationService
 * 
 * We test the class in isolation by resetting the singleton
 * and mocking browser APIs (localStorage, navigator, document).
 */

// Mock browser globals before importing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
Object.defineProperty(global, 'navigator', {
  value: { language: 'sv-SE' },
  writable: true,
  configurable: true,
});
Object.defineProperty(global, 'document', {
  value: {
    documentElement: { lang: '' },
    title: '',
  },
  writable: true,
  configurable: true,
});

// Reset module cache between tests so the singleton re-initialises
beforeEach(() => {
  jest.resetModules();
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  (global as any).navigator = { language: 'sv-SE' };
  (global as any).document = { documentElement: { lang: '' }, title: '' };
});

function loadService() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { i18n } = require('../../src/services/TranslationService');
  return i18n;
}

describe('TranslationService', () => {
  describe('locale detection', () => {
    it('should default to sv when browser language is Swedish', () => {
      const i18n = loadService();
      expect(i18n.getLocale()).toBe('sv');
    });

    it('should detect English from browser language', () => {
      (global as any).navigator = { language: 'en-US' };
      const i18n = loadService();
      expect(i18n.getLocale()).toBe('en');
    });

    it('should fall back to default locale for unsupported language', () => {
      (global as any).navigator = { language: 'fr-FR' };
      const i18n = loadService();
      expect(i18n.getLocale()).toBe('sv'); // default
    });

    it('should prefer localStorage over browser language', () => {
      localStorageMock.getItem.mockReturnValueOnce('en');
      (global as any).navigator = { language: 'sv-SE' };
      const i18n = loadService();
      expect(i18n.getLocale()).toBe('en');
    });
  });

  describe('translation lookup', () => {
    it('should translate a simple key', () => {
      const i18n = loadService();
      expect(i18n.t('ui.answerLabel')).toBe('Svar:');
    });

    it('should translate nested keys', () => {
      const i18n = loadService();
      expect(i18n.t('ui.directions.north')).toBe('NORR');
    });

    it('should return the key itself when not found', () => {
      const i18n = loadService();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
      warnSpy.mockRestore();
    });

    it('should return key when lookup resolves to non-string', () => {
      const i18n = loadService();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      // "ui.directions" resolves to an object, not a string
      expect(i18n.t('ui.directions')).toBe('ui.directions');
      warnSpy.mockRestore();
    });
  });

  describe('setLocale', () => {
    it('should switch to English and update translations', () => {
      const i18n = loadService();
      i18n.setLocale('en');
      expect(i18n.getLocale()).toBe('en');
      expect(i18n.t('ui.answerLabel')).toBe('Answer:');
    });

    it('should persist locale to localStorage', () => {
      const i18n = loadService();
      i18n.setLocale('en');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('preferredLanguage', 'en');
    });

    it('should update document.documentElement.lang', () => {
      const i18n = loadService();
      i18n.setLocale('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should reject unsupported locales', () => {
      const i18n = loadService();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      i18n.setLocale('fr');
      expect(i18n.getLocale()).toBe('sv'); // unchanged
      errorSpy.mockRestore();
    });
  });

  describe('listeners', () => {
    it('should notify listeners on locale change', () => {
      const i18n = loadService();
      const listener = jest.fn();
      i18n.onChange(listener);
      i18n.setLocale('en');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should not notify after unregister', () => {
      const i18n = loadService();
      const listener = jest.fn();
      i18n.onChange(listener);
      i18n.offChange(listener);
      i18n.setLocale('en');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('getSupportedLocales', () => {
    it('should return all supported locales', () => {
      const i18n = loadService();
      const locales = i18n.getSupportedLocales();
      expect(locales).toEqual(expect.arrayContaining(['sv', 'en']));
      expect(locales.length).toBe(2);
    });
  });
});
