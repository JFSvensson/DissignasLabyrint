import { Direction } from './types';
import { i18n } from '../services/TranslationService';
import { SupportedLocale } from '../locales';

export class GameUI {
  private container: HTMLDivElement;
  private questionDisplay: HTMLDivElement;
  private answerInput: HTMLInputElement;
  private directionButtons: Map<string, HTMLButtonElement>;
  private messageDisplay: HTMLDivElement;
  private languageSwitcher: HTMLDivElement;

  constructor(containerId: string, onAnswer: (answer: number, direction: string) => void) {
    // Huvudcontainer
    this.container = document.createElement('div');
    this.container.style.cssText = `
      width: 100%;
      max-width: 500px;
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 10px;
      color: white;
      font-family: Arial, sans-serif;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    
    // Frågedisplay
    this.questionDisplay = document.createElement('div');
    this.questionDisplay.style.cssText = `
      margin-bottom: 15px;
      font-size: 18px;
      text-align: center;
      padding: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    `;
    this.container.appendChild(this.questionDisplay);

    // Input-container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 15px;
      gap: 10px;
    `;

    // Label för input
    const inputLabel = document.createElement('label');
    inputLabel.textContent = i18n.t('ui.answerLabel');
    inputLabel.style.cssText = `
      font-size: 16px;
    `;
    inputContainer.appendChild(inputLabel);

    // Input för svar
    this.answerInput = document.createElement('input');
    this.answerInput.type = 'number';
    this.answerInput.style.cssText = `
      padding: 8px;
      font-size: 16px;
      width: 100px;
      border: none;
      border-radius: 5px;
      background: rgba(255,255,255,0.9);
    `;
    this.answerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.getActiveButton()) {
        const activeButton = this.getActiveButton();
        if (activeButton) {
          activeButton.click();
        }
      }
    });
    inputContainer.appendChild(this.answerInput);

    this.container.appendChild(inputContainer);

    // Container för riktningsknappar
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: grid;
      grid-template-areas:
        ". forward ."
        "left . right"
        ". back .";
      grid-gap: 10px;
      justify-content: center;
    `;
    
    // Skapa riktningsknappar
    this.directionButtons = new Map();
    const directions = [
      { name: 'NORTH', area: 'forward', symbol: '⬆️', translationKey: 'ui.directions.north' },
      { name: 'EAST', area: 'right', symbol: '➡️', translationKey: 'ui.directions.east' },
      { name: 'WEST', area: 'left', symbol: '⬅️', translationKey: 'ui.directions.west' },
      { name: 'SOUTH', area: 'back', symbol: '⬇️', translationKey: 'ui.directions.south' }
    ];

    directions.forEach(({ name, area, symbol, translationKey }) => {
      const button = document.createElement('button');
      button.textContent = `${symbol} ${i18n.t(translationKey)}`;
      button.dataset.translationKey = translationKey;
      button.dataset.symbol = symbol;
      button.style.cssText = `
        grid-area: ${area};
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
        display: none;
      `;
      button.addEventListener('mouseover', () => {
        button.style.background = '#45a049';
      });
      button.addEventListener('mouseout', () => {
        button.style.background = '#4CAF50';
      });
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
    this.messageDisplay.style.cssText = `
      margin-top: 10px;
      text-align: center;
      color: #ff4444;
      min-height: 20px;
      font-size: 14px;
    `;
    this.container.appendChild(this.messageDisplay);

    // Language switcher
    this.languageSwitcher = this.createLanguageSwitcher();
    this.container.appendChild(this.languageSwitcher);

    document.getElementById('ui-container')?.appendChild(this.container);

    // Listen for locale changes
    i18n.onChange(() => this.updateTranslations());
  }

  private getActiveButton(): HTMLButtonElement | null {
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

  public updateQuestions(questions: Array<{ direction: string, question: string }>): void {
    // Uppdatera frågedisplayen
    this.questionDisplay.innerHTML = questions
      .map(q => `<div style="margin: 5px 0;">${q.direction}: ${q.question}</div>`)
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

  private createLanguageSwitcher(): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    `;

    const label = document.createElement('span');
    label.textContent = i18n.t('ui.language.selectLanguage');
    label.style.cssText = 'font-size: 14px;';
    label.dataset.translationKey = 'ui.language.selectLanguage';
    container.appendChild(label);

    const locales = i18n.getSupportedLocales();
    locales.forEach(locale => {
      const button = document.createElement('button');
      const translationKey = `ui.language.${locale === 'sv' ? 'swedish' : 'english'}`;
      button.textContent = i18n.t(translationKey);
      button.dataset.translationKey = translationKey;
      button.style.cssText = `
        padding: 5px 15px;
        background: ${i18n.getLocale() === locale ? '#2196F3' : 'rgba(255,255,255,0.1)'};
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      `;
      button.onclick = () => {
        i18n.setLocale(locale);
      };
      container.appendChild(button);
    });

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
          if (key.startsWith('ui.language.')) {
            const locale = key === 'ui.language.swedish' ? 'sv' : 'en';
            element.style.background = i18n.getLocale() === locale ? '#2196F3' : 'rgba(255,255,255,0.1)';
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
}
