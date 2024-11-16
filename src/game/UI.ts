export class GameUI {
  private container: HTMLDivElement;
  private questionDisplay: HTMLDivElement;
  private answerInput: HTMLInputElement;
  private directionButtons: Map<string, HTMLButtonElement>;
  private messageDisplay: HTMLDivElement;

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
    inputLabel.textContent = 'Svar:';
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
      { name: 'FORWARD', area: 'forward', symbol: '↑' },
      { name: 'LEFT', area: 'left', symbol: '←' },
      { name: 'RIGHT', area: 'right', symbol: '→' },
      { name: 'BACK', area: 'back', symbol: '↓' }
    ];

    directions.forEach(({ name, area, symbol }) => {
      const button = document.createElement('button');
      button.textContent = `${symbol} ${name}`;
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
          this.showMessage('Ange ett giltigt nummer!');
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

    document.getElementById('ui-container')?.appendChild(this.container);
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
}
