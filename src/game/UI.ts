import { Direction } from './types';
import { i18n } from '../services/TranslationService';
import { IAudioService } from '../interfaces/IAudioService';
import { GameTimer } from './GameTimer';
import { LOCALE_NAMES } from '../shared/localeConfig';
import { showVictoryScreen as showVictoryOverlay } from './VictoryScreen';

export class GameUI {
  private container: HTMLDivElement;
  private questionDisplay: HTMLDivElement;
  private answerInput: HTMLInputElement;
  private directionButtons: Map<Direction, HTMLButtonElement>;
  private messageDisplay: HTMLDivElement;
  private languageSwitcher: HTMLDivElement;
  private soundManager: IAudioService | null;
  private topBar: HTMLDivElement;
  private localeChangeHandler: () => void;

  constructor(containerId: string, onAnswer: (answer: number, direction: Direction) => void, soundManager?: IAudioService) {
    this.soundManager = soundManager || null;
    // Huvudcontainer
    this.container = document.createElement('div');
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', i18n.t('ui.aria.gameControls'));
    this.container.className = 'game-panel';

    // Top bar for level and timer
    this.topBar = document.createElement('div');
    this.topBar.className = 'top-bar';
    this.container.appendChild(this.topBar);
    
    // Score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score-display';
    scoreDisplay.className = 'score-display';
    scoreDisplay.innerHTML = `
      <span><strong>${i18n.t('ui.score.label')}</strong> <span id="score-value">0</span></span>
      <span><strong>${i18n.t('ui.score.attempts')}</strong> <span id="attempts-value">0</span></span>
      <span><strong>${i18n.t('ui.score.streak')}</strong> <span id="streak-value">0</span></span>
    `;
    this.container.appendChild(scoreDisplay);

    // Frågedisplay
    this.questionDisplay = document.createElement('div');
    this.questionDisplay.className = 'question-display';
    this.container.appendChild(this.questionDisplay);

    // Input-container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

    // Label för input
    const inputLabel = document.createElement('label');
    inputLabel.textContent = i18n.t('ui.answerLabel');
    inputLabel.className = 'input-label';
    inputContainer.appendChild(inputLabel);

    // Input för svar
    this.answerInput = document.createElement('input');
    this.answerInput.type = 'number';
    this.answerInput.setAttribute('aria-label', i18n.t('ui.answerLabel'));
    this.answerInput.className = 'answer-input';
    this.answerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.getActiveButton()) {
        const activeButton = this.getActiveButton();
        if (activeButton) {
          activeButton.click();
        }
      }
    });
    // Keyboard navigation: arrow keys and WASD to trigger direction buttons
    this.answerInput.addEventListener('keydown', (e) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'NORTH', ArrowDown: 'SOUTH', ArrowLeft: 'WEST', ArrowRight: 'EAST',
        w: 'NORTH', s: 'SOUTH', a: 'WEST', d: 'EAST',
        W: 'NORTH', S: 'SOUTH', A: 'WEST', D: 'EAST',
      };
      const direction = keyMap[e.key];
      if (direction) {
        const btn = this.directionButtons.get(direction);
        if (btn && btn.style.display !== 'none') {
          e.preventDefault();
          btn.click();
        }
      }
    });
    inputContainer.appendChild(this.answerInput);

    this.container.appendChild(inputContainer);

    // Container för riktningsknappar
    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('role', 'group');
    buttonContainer.setAttribute('aria-label', i18n.t('ui.aria.directionButtons'));
    buttonContainer.className = 'direction-grid';
    
    // Skapa riktningsknappar
    this.directionButtons = new Map();
    const directions: { name: Direction; cssDir: string; symbol: string; translationKey: string }[] = [
      { name: 'NORTH', cssDir: 'north', symbol: '⬆️', translationKey: 'ui.directions.north' },
      { name: 'EAST', cssDir: 'east', symbol: '➡️', translationKey: 'ui.directions.east' },
      { name: 'WEST', cssDir: 'west', symbol: '⬅️', translationKey: 'ui.directions.west' },
      { name: 'SOUTH', cssDir: 'south', symbol: '⬇️', translationKey: 'ui.directions.south' }
    ];

    directions.forEach(({ name, cssDir, symbol, translationKey }) => {
      const button = document.createElement('button');
      button.textContent = `${symbol} ${i18n.t(translationKey)}`;
      button.setAttribute('aria-label', i18n.t(translationKey));
      button.dataset.translationKey = translationKey;
      button.dataset.symbol = symbol;
      button.className = `btn btn-direction btn-direction--${cssDir}`;
      button.onclick = () => {
        const answer = parseInt(this.answerInput.value);
        if (!isNaN(answer)) {
          onAnswer(answer, name);
          this.answerInput.value = '';
          this.showMessage('');  // Rensa eventuellt meddelande
        } else {
          this.showMessage(i18n.t('ui.validation.invalidNumber'));
        }
      };
      this.directionButtons.set(name, button);
      buttonContainer.appendChild(button);
    });

    this.container.appendChild(buttonContainer);

    // Meddelandedisplay för feedback
    this.messageDisplay = document.createElement('div');
    this.messageDisplay.setAttribute('role', 'status');
    this.messageDisplay.setAttribute('aria-live', 'polite');
    this.messageDisplay.className = 'message-display';
    this.container.appendChild(this.messageDisplay);

    // Language switcher
    this.languageSwitcher = this.createLanguageSwitcher();
    this.container.appendChild(this.languageSwitcher);

    // Sound toggle
    if (this.soundManager) {
      this.container.appendChild(this.createSoundToggle(this.soundManager));
      this.container.appendChild(this.createMusicToggle(this.soundManager));
    }

    document.getElementById('ui-container')?.appendChild(this.container);

    // Listen for locale changes
    this.localeChangeHandler = () => this.updateTranslations();
    i18n.onChange(this.localeChangeHandler);
  }

  public dispose(): void {
    i18n.offChange(this.localeChangeHandler);
    this.container.remove();
  }

  private getActiveButton(): HTMLButtonElement | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, button] of this.directionButtons) {
      if (button.style.display !== 'none') {
        return button;
      }
    }
    return null;
  }

  private showMessage(message: string): void {
    this.messageDisplay.textContent = message;
  }

  public showFeedback(message: string, type: 'success' | 'error' = 'error'): void {
    this.messageDisplay.textContent = message;
    this.messageDisplay.style.color = type === 'success' ? '#4CAF50' : '#ff4444';
    // Quick scale pulse for visual feedback
    this.messageDisplay.style.transform = 'scale(1.15)';
    this.messageDisplay.style.transition = 'color 0.2s ease, transform 0.15s ease';
    requestAnimationFrame(() => {
      setTimeout(() => { this.messageDisplay.style.transform = 'scale(1)'; }, 150);
    });
  }

  public updateScore(score: number, attempts: number, streak: number = 0): void {
    const scoreValue = document.getElementById('score-value');
    const attemptsValue = document.getElementById('attempts-value');
    const streakValue = document.getElementById('streak-value');
    if (scoreValue) scoreValue.textContent = score.toString();
    if (attemptsValue) attemptsValue.textContent = attempts.toString();
    if (streakValue) streakValue.textContent = streak.toString();
  }

  public updateQuestions(questions: Array<{ direction: Direction, question: string }>): void {
    // Uppdatera frågedisplayen
    this.questionDisplay.innerHTML = questions
      .map(q => `<div class="question-row">${this.getDirectionLabel(q.direction)}: ${q.question}</div>`)
      .join('');

    // Visa/dölj knappar baserat på tillgängliga riktningar
    this.directionButtons.forEach((button, direction) => {
      const hasQuestion = questions.some(q => q.direction === direction);
      button.style.display = hasQuestion ? 'block' : 'none';
    });

    // Fokusera på input-fältet
    this.answerInput.focus();
  }

  private getDirectionButton(direction: Direction): string {
    const directionIcons = {
      'NORTH': '⬆️',
      'SOUTH': '⬇️',
      'EAST': '➡️',
      'WEST': '⬅️'
    };
    return directionIcons[direction] || '?';
  }

  private getDirectionLabel(direction: Direction): string {
    const directionKeys: Record<Direction, string> = {
      NORTH: 'ui.directions.north',
      SOUTH: 'ui.directions.south',
      EAST: 'ui.directions.east',
      WEST: 'ui.directions.west'
    };

    const key = directionKeys[direction];
    return key ? i18n.t(key) : direction;
  }

  private createLanguageSwitcher(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'language-switcher';

    const label = document.createElement('span');
    label.textContent = i18n.t('ui.language.selectLanguage');
    label.className = 'language-label';
    label.dataset.translationKey = 'ui.language.selectLanguage';
    container.appendChild(label);

    const locales = i18n.getSupportedLocales();
    locales.forEach(locale => {
      const translationKey = LOCALE_NAMES[locale] || `ui.language.${locale}`;
      const button = document.createElement('button');
      button.textContent = i18n.t(translationKey);
      button.dataset.translationKey = translationKey;
      button.dataset.locale = locale;
      button.className = `btn btn-lang${i18n.getLocale() === locale ? ' btn-lang--active' : ''}`;
      button.onclick = () => {
        i18n.setLocale(locale);
      };
      container.appendChild(button);
    });

    return container;
  }

  private createSoundToggle(sm: IAudioService): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'toggle-container';

    const button = document.createElement('button');
    const update = () => {
      button.textContent = sm.isEnabled() ? '🔊 ' + i18n.t('ui.sound.on') : '🔇 ' + i18n.t('ui.sound.off');
    };
    update();
    button.className = 'btn btn-ghost';
    button.onclick = () => {
      sm.setEnabled(!sm.isEnabled());
      update();
    };
    container.appendChild(button);
    return container;
  }

  private createMusicToggle(sm: IAudioService): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'toggle-container toggle-container--tight';

    const button = document.createElement('button');
    const update = () => {
      button.textContent = sm.isMusicPlaying() ? '🎵 ' + i18n.t('ui.music.on') : '🎵 ' + i18n.t('ui.music.off');
    };
    update();
    button.className = 'btn btn-ghost';
    button.onclick = () => {
      sm.toggleMusic();
      update();
    };
    container.appendChild(button);
    return container;
  }

  private updateTranslations(): void {
    // Update all elements with translation keys
    const elementsWithTranslations = this.container.querySelectorAll('[data-translation-key]');
    elementsWithTranslations.forEach(element => {
      const key = element.getAttribute('data-translation-key');
      if (key) {
        if (element.tagName === 'BUTTON' && element instanceof HTMLButtonElement) {
          const symbol = element.dataset.symbol;
          if (symbol) {
            element.textContent = `${symbol} ${i18n.t(key)}`;
          } else {
            element.textContent = i18n.t(key);
          }
          // Update language switcher button styles
          if (element.dataset.locale) {
            if (i18n.getLocale() === element.dataset.locale) {
              element.classList.add('btn-lang--active');
            } else {
              element.classList.remove('btn-lang--active');
            }
          }
        } else {
          element.textContent = i18n.t(key);
        }
      }
    });

    // Update input label (doesn't have dataset)
    const inputLabel = this.container.querySelector('label');
    if (inputLabel) {
      inputLabel.textContent = i18n.t('ui.answerLabel');
    }
  }

  public setTimer(timer: GameTimer): void {
    const el = timer.getElement();
    el.className = 'timer-display';
    this.topBar.appendChild(el);
  }

  public setLevel(level: number): void {
    const el = document.createElement('span');
    el.textContent = `${i18n.t('ui.level.label')} ${level}`;
    el.className = 'level-display';
    this.topBar.insertBefore(el, this.topBar.firstChild);
  }

  public showVictoryScreen(score: number, attempts: number, accuracy: number, bestStreak: number, onPlayAgain: () => void, timeRemaining?: number, onNextLevel?: () => void, isNewHighScore?: boolean): void {
    showVictoryOverlay({ score, attempts, accuracy, bestStreak, onPlayAgain, timeRemaining, onNextLevel, isNewHighScore });
  }
}
