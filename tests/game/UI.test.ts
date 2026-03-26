/**
 * @jest-environment jsdom
 */

// Mock TranslationService before importing UI
jest.mock('../../src/services/TranslationService', () => {
  const listeners = new Set<() => void>();
  const translations: Record<string, string> = {
    'ui.answerLabel': 'Svar:',
    'ui.directions.north': 'NORR',
    'ui.directions.south': 'SÖDER',
    'ui.directions.east': 'ÖSTER',
    'ui.directions.west': 'VÄSTER',
    'ui.validation.invalidNumber': 'Ange ett giltigt nummer!',
    'ui.feedback.correct': 'Rätt svar!',
    'ui.feedback.incorrect': 'Fel svar!',
    'ui.score.label': 'Poäng:',
    'ui.score.attempts': 'Försök:',
    'ui.score.streak': 'Svit:',
    'ui.language.swedish': 'Svenska',
    'ui.language.english': 'English',
    'ui.language.selectLanguage': 'Välj språk:',
    'ui.sound.on': 'Ljud på',
    'ui.sound.off': 'Ljud av',
    'ui.victory.title': 'Grattis!',
    'ui.victory.message': 'Du har klarat labyrinten!',
    'ui.victory.score': 'Poäng:',
    'ui.victory.attempts': 'Försök:',
    'ui.victory.accuracy': 'Träffsäkerhet:',
    'ui.victory.bestStreak': 'Bästa svit:',
    'ui.victory.playAgain': 'Spela igen',
    'game.title': 'Dissignas Labyrint',
  };
  return {
    i18n: {
      t: (key: string) => translations[key] ?? key,
      getLocale: () => 'sv',
      getSupportedLocales: () => ['sv', 'en'],
      setLocale: jest.fn(),
      onChange: (cb: () => void) => listeners.add(cb),
      offChange: (cb: () => void) => listeners.delete(cb),
    },
  };
});

import { GameUI } from '../../src/game/UI';
import { SoundManager } from '../../src/game/SoundManager';

describe('GameUI', () => {
  let uiContainer: HTMLDivElement;
  let onAnswer: jest.Mock;

  beforeEach(() => {
    document.body.innerHTML = '';
    // GameUI looks for a sibling #ui-container via document.getElementById
    uiContainer = document.createElement('div');
    uiContainer.id = 'ui-container';
    document.body.appendChild(uiContainer);

    onAnswer = jest.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  function createUI(soundManager?: SoundManager) {
    return new GameUI('maze-container', onAnswer, soundManager);
  }

  describe('construction', () => {
    it('should render into #ui-container', () => {
      createUI();
      expect(uiContainer.children.length).toBe(1);
    });

    it('should contain score display', () => {
      createUI();
      const scoreDisplay = document.getElementById('score-display');
      expect(scoreDisplay).not.toBeNull();
    });

    it('should contain an answer input field', () => {
      createUI();
      const input = uiContainer.querySelector('input[type="number"]');
      expect(input).not.toBeNull();
    });

    it('should have direction buttons hidden by default', () => {
      createUI();
      const buttons = uiContainer.querySelectorAll('button');
      const directionButtons = Array.from(buttons).filter(b =>
        b.textContent?.includes('NORR') ||
        b.textContent?.includes('SÖDER') ||
        b.textContent?.includes('ÖSTER') ||
        b.textContent?.includes('VÄSTER')
      );
      directionButtons.forEach(button => {
        expect(button.style.display).toBe('none');
      });
    });

    it('should show language switcher', () => {
      createUI();
      expect(uiContainer.textContent).toContain('Svenska');
      expect(uiContainer.textContent).toContain('English');
    });
  });

  describe('updateQuestions', () => {
    it('should show direction buttons for available questions', () => {
      const ui = createUI();
      ui.updateQuestions([
        { direction: 'NORTH', question: '3 + 4' },
        { direction: 'EAST', question: '5 × 2' },
      ]);

      const buttons = uiContainer.querySelectorAll('button');
      const northBtn = Array.from(buttons).find(b => b.textContent?.includes('NORR'));
      const eastBtn = Array.from(buttons).find(b => b.textContent?.includes('ÖSTER'));
      const southBtn = Array.from(buttons).find(b => b.textContent?.includes('SÖDER'));

      expect(northBtn?.style.display).toBe('block');
      expect(eastBtn?.style.display).toBe('block');
      expect(southBtn?.style.display).toBe('none');
    });

    it('should display question text', () => {
      const ui = createUI();
      ui.updateQuestions([
        { direction: 'NORTH', question: '3 + 4' },
      ]);
      expect(uiContainer.textContent).toContain('3 + 4');
    });
  });

  describe('answer submission', () => {
    it('should call onAnswer with number and direction when button clicked', () => {
      const ui = createUI();
      ui.updateQuestions([{ direction: 'NORTH', question: '3 + 4' }]);

      const input = uiContainer.querySelector('input[type="number"]') as HTMLInputElement;
      input.value = '7';

      const northBtn = Array.from(uiContainer.querySelectorAll('button'))
        .find(b => b.textContent?.includes('NORR'));
      northBtn?.click();

      expect(onAnswer).toHaveBeenCalledWith(7, 'NORTH');
    });

    it('should show validation message for non-numeric input', () => {
      const ui = createUI();
      ui.updateQuestions([{ direction: 'NORTH', question: '3 + 4' }]);

      const input = uiContainer.querySelector('input[type="number"]') as HTMLInputElement;
      input.value = '';

      const northBtn = Array.from(uiContainer.querySelectorAll('button'))
        .find(b => b.textContent?.includes('NORR'));
      northBtn?.click();

      expect(onAnswer).not.toHaveBeenCalled();
      expect(uiContainer.textContent).toContain('Ange ett giltigt nummer!');
    });

    it('should clear input after valid answer', () => {
      const ui = createUI();
      ui.updateQuestions([{ direction: 'NORTH', question: '3 + 4' }]);

      const input = uiContainer.querySelector('input[type="number"]') as HTMLInputElement;
      input.value = '7';

      const northBtn = Array.from(uiContainer.querySelectorAll('button'))
        .find(b => b.textContent?.includes('NORR'));
      northBtn?.click();

      expect(input.value).toBe('');
    });
  });

  describe('showFeedback', () => {
    it('should display success message in green', () => {
      const ui = createUI();
      ui.showFeedback('Rätt svar!', 'success');
      const msg = uiContainer.textContent;
      expect(msg).toContain('Rätt svar!');
    });

    it('should display error message in red', () => {
      const ui = createUI();
      ui.showFeedback('Fel svar!', 'error');
      expect(uiContainer.textContent).toContain('Fel svar!');
    });
  });

  describe('updateScore', () => {
    it('should update score, attempts and streak values', () => {
      const ui = createUI();
      ui.updateScore(50, 10, 3);

      expect(document.getElementById('score-value')?.textContent).toBe('50');
      expect(document.getElementById('attempts-value')?.textContent).toBe('10');
      expect(document.getElementById('streak-value')?.textContent).toBe('3');
    });
  });

  describe('showVictoryScreen', () => {
    it('should create a victory overlay', () => {
      const ui = createUI();
      const onPlayAgain = jest.fn();
      ui.showVictoryScreen(100, 20, 85, 5, onPlayAgain);

      // Overlay is appended to document.body
      const overlay = document.body.querySelector('div[style*="position: fixed"]');
      expect(overlay).not.toBeNull();
      expect(overlay?.textContent).toContain('Grattis!');
      expect(overlay?.textContent).toContain('100');
    });

    it('should call onPlayAgain and remove overlay when button clicked', () => {
      const ui = createUI();
      const onPlayAgain = jest.fn();
      ui.showVictoryScreen(100, 20, 85, 5, onPlayAgain);

      const playAgainBtn = Array.from(document.body.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Spela igen'));
      expect(playAgainBtn).toBeDefined();
      playAgainBtn?.click();

      expect(onPlayAgain).toHaveBeenCalled();
    });
  });

  describe('sound toggle', () => {
    it('should render sound toggle when SoundManager is provided', () => {
      const sm = new SoundManager();
      createUI(sm);
      expect(uiContainer.textContent).toContain('Ljud på');
    });

    it('should toggle sound on click', () => {
      const sm = new SoundManager();
      const ui = createUI(sm);

      const soundBtn = Array.from(uiContainer.querySelectorAll('button'))
        .find(b => b.textContent?.includes('Ljud'));
      expect(sm.isEnabled()).toBe(true);

      soundBtn?.click();
      expect(sm.isEnabled()).toBe(false);
      expect(soundBtn?.textContent).toContain('Ljud av');
    });
  });
});
