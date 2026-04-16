/**
 * @jest-environment jsdom
 */

jest.mock('../../src/services/TranslationService', () => ({
  i18n: {
    t: (key: string) => {
      const map: Record<string, string> = {
        'game.title': 'Dissignas Labyrint',
        'game.welcome': 'Välkommen',
        'ui.settings.mazeSize': 'Labyrintstorlek:',
        'ui.settings.mathDifficulty': 'Mattesvårighet:',
        'ui.settings.timer': 'Tidsgräns:',
        'ui.settings.timerOff': 'Av',
        'ui.settings.easy': 'Lätt',
        'ui.settings.medium': 'Medel',
        'ui.settings.hard': 'Svår',
        'ui.settings.start': 'Starta spelet',
        'ui.settings.startLevel': 'Starta nivå',
        'ui.level.label': 'Nivå',
        'ui.tutorial.howToPlay': 'Hur man spelar',
        'ui.tutorial.title': 'Hur man spelar',
        'ui.tutorial.step1': 'Steg 1',
        'ui.tutorial.step2': 'Steg 2',
        'ui.tutorial.step3': 'Steg 3',
        'ui.tutorial.step4': 'Steg 4',
        'ui.tutorial.step5': 'Steg 5',
        'ui.tutorial.tip': 'Tips!',
        'ui.tutorial.close': 'Uppfattat!',
        'ui.language.selectLanguage': 'Välj språk:',
        'ui.language.swedish': 'Svenska',
        'ui.language.english': 'English',
      };
      return map[key] ?? key;
    },
    getSupportedLocales: () => ['sv', 'en'],
    getLocale: () => 'sv',
    setLocale: jest.fn(),
    onChange: jest.fn(),
    offChange: jest.fn(),
  },
}));

import { StartScreen } from '../../src/game/StartScreen';
import { GameConfig } from '../../src/game/GameConfig';

describe('StartScreen', () => {
  let startScreen: StartScreen;

  beforeEach(() => {
    document.body.innerHTML = '';
    startScreen = new StartScreen();
  });

  afterEach(() => {
    startScreen.remove();
  });

  describe('show', () => {
    it('should create a full-screen overlay', () => {
      startScreen.show(jest.fn());
      const overlay = document.body.querySelector('.overlay-backdrop--start');
      expect(overlay).toBeTruthy();
    });

    it('should display the game title', () => {
      startScreen.show(jest.fn());
      expect(document.body.textContent).toContain('Dissignas Labyrint');
    });

    it('should show maze size options', () => {
      startScreen.show(jest.fn());
      expect(document.body.textContent).toContain('5×5');
      expect(document.body.textContent).toContain('9×9');
      expect(document.body.textContent).toContain('13×13');
    });

    it('should show difficulty options', () => {
      startScreen.show(jest.fn());
      expect(document.body.textContent).toContain('Lätt');
      expect(document.body.textContent).toContain('Medel');
      expect(document.body.textContent).toContain('Svår');
    });

    it('should show timer options', () => {
      startScreen.show(jest.fn());
      expect(document.body.textContent).toContain('Av');
      expect(document.body.textContent).toContain('2 min');
      expect(document.body.textContent).toContain('5 min');
    });

    it('should show start button', () => {
      startScreen.show(jest.fn());
      const buttons = document.body.querySelectorAll('button');
      const startBtn = Array.from(buttons).find(b => b.textContent === 'Starta spelet');
      expect(startBtn).toBeTruthy();
    });

    it('should show tutorial link', () => {
      startScreen.show(jest.fn());
      expect(document.body.textContent).toContain('Hur man spelar');
    });

    it('should call onStart with config when start button is clicked', () => {
      const onStart = jest.fn();
      startScreen.show(onStart);
      // Click start button (defaults: 9×9, medium, timer off)
      const buttons = document.body.querySelectorAll('button');
      const startBtn = Array.from(buttons).find(b => b.textContent === 'Starta spelet');
      startBtn!.click();
      expect(onStart).toHaveBeenCalledTimes(1);
      const config: GameConfig = onStart.mock.calls[0][0];
      expect(config.mazeSize).toBe(9);
      expect(config.mathDifficulty).toBe('medium');
      expect(config.timerEnabled).toBe(false);
    });

    it('should show level badge when currentLevel is provided', () => {
      startScreen.show(jest.fn(), 3);
      expect(document.body.textContent).toContain('Nivå');
      expect(document.body.textContent).toContain('3');
    });

    it('should remove overlay after start', () => {
      startScreen.show(jest.fn());
      const buttons = document.body.querySelectorAll('button');
      const startBtn = Array.from(buttons).find(b => b.textContent === 'Starta spelet');
      startBtn!.click();
      // Overlay should be removed
      expect(document.body.querySelector('.overlay-backdrop--start')).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove the overlay from DOM', () => {
      startScreen.show(jest.fn());
      expect(document.body.children.length).toBeGreaterThan(0);
      startScreen.remove();
      expect(document.body.querySelector('.overlay-backdrop--start')).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      startScreen.show(jest.fn());
      startScreen.remove();
      startScreen.remove(); // should not throw
    });
  });

  describe('tutorial', () => {
    it('should open tutorial overlay when link is clicked', () => {
      startScreen.show(jest.fn());
      const tutorialBtn = Array.from(document.body.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Hur man spelar'));
      tutorialBtn!.click();
      // Tutorial overlay has z-index 3000
      const tutorialOverlay = document.body.querySelector('.overlay-backdrop--modal');
      expect(tutorialOverlay).toBeTruthy();
    });

    it('should show all 5 tutorial steps', () => {
      startScreen.show(jest.fn());
      const tutorialBtn = Array.from(document.body.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Hur man spelar'));
      tutorialBtn!.click();
      for (let i = 1; i <= 5; i++) {
        expect(document.body.textContent).toContain(`Steg ${i}`);
      }
    });

    it('should close tutorial when close button is clicked', () => {
      startScreen.show(jest.fn());
      const tutorialBtn = Array.from(document.body.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Hur man spelar'));
      tutorialBtn!.click();
      const closeBtn = Array.from(document.body.querySelectorAll('button'))
        .find(b => b.textContent === 'Uppfattat!');
      closeBtn!.click();
      expect(document.body.querySelector('.overlay-backdrop--modal')).toBeNull();
    });
  });
});
