export class GameUI {
  private container: HTMLDivElement;
  private questionDisplay: HTMLDivElement;
  private answerInput: HTMLInputElement;
  private directionButtons: Map<string, HTMLButtonElement>;

  constructor(containerId: string, onAnswer: (answer: number, direction: string) => void) {
    // Skapa huvudcontainer
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 10px;
      color: white;
      text-align: center;
    `;
    
    // Frågedisplay
    this.questionDisplay = document.createElement('div');
    this.questionDisplay.style.marginBottom = '10px';
    this.container.appendChild(this.questionDisplay);

    // Input för svar
    this.answerInput = document.createElement('input');
    this.answerInput.type = 'number';
    this.answerInput.style.cssText = `
      margin: 10px;
      padding: 5px;
      font-size: 16px;
      width: 100px;
    `;
    this.container.appendChild(this.answerInput);

    // Container för riktningsknappar
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'grid';
    buttonContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    buttonContainer.style.gap = '5px';
    
    // Skapa riktningsknappar
    this.directionButtons = new Map();
    ['FORWARD', 'LEFT', 'RIGHT', 'BACK'].forEach(direction => {
      const button = document.createElement('button');
      button.textContent = direction;
      button.style.cssText = `
        padding: 10px;
        margin: 5px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: none;
      `;
      button.onclick = () => {
        const answer = parseInt(this.answerInput.value);
        if (!isNaN(answer)) {
          onAnswer(answer, direction);
          this.answerInput.value = '';
        }
      };
      this.directionButtons.set(direction, button);
      buttonContainer.appendChild(button);
    });

    this.container.appendChild(buttonContainer);
    document.getElementById(containerId)?.appendChild(this.container);
  }

  public updateQuestions(questions: Array<{ direction: string, question: string }>) {
    // Uppdatera frågedisplayen och visa relevanta knappar
    this.questionDisplay.innerHTML = questions
      .map(q => `${q.direction}: ${q.question}`)
      .join('<br>');

    // Visa/dölj knappar baserat på tillgängliga riktningar
    this.directionButtons.forEach((button, direction) => {
      const hasQuestion = questions.some(q => q.direction === direction);
      button.style.display = hasQuestion ? 'block' : 'none';
    });
  }
}
