import { MazeRenderer } from './MazeRenderer';
import { MathQuestionGenerator } from './MathQuestionGenerator';
import { Addition } from './operations/Addition';

export function initWebGame() {
  const maze = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];

  const mazeRenderer = new MazeRenderer('maze-container', maze);
  const mathGenerator = new MathQuestionGenerator(new Addition());

  let currentQuestion: { question: string; answer: number };

  function askQuestion() {
    currentQuestion = mathGenerator.generateQuestion();
    mazeRenderer.updateQuestionText(currentQuestion.question);
  }

  function checkAnswer(userAnswer: number) {
    if (userAnswer === currentQuestion.answer) {
      console.log('Rätt svar! Bra jobbat!');
      mazeRenderer.movePlayer();
      askQuestion();
    } else {
      console.log(`Tyvärr, fel svar. Rätt svar var ${currentQuestion.answer}.`);
    }
  }

  // Skapa ett enkelt input-fält för svar
  const input = document.createElement('input');
  input.type = 'number';
  input.style.position = 'absolute';
  input.style.bottom = '20px';
  input.style.left = '50%';
  input.style.transform = 'translateX(-50%)';
  document.body.appendChild(input);

  input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      checkAnswer(parseInt(input.value));
      input.value = '';
    }
  });

  askQuestion();
}

if (typeof window !== 'undefined') {
  window.onload = () => {
    initWebGame();
  };
}
