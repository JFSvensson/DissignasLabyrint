import { MathQuestionGenerator } from './MathQuestionGenerator';
import { Addition } from './operations/Addition';
import * as readline from 'readline';

export function initTerminalGame() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const generator = new MathQuestionGenerator(new Addition());

  console.log('Välkommen till Matematiska Labyrinten!');

  function askQuestion() {
    const { question, answer } = generator.generateQuestion();
    rl.question(`Vad är ${question}? `, (userAnswer) => {
      if (parseInt(userAnswer) === answer) {
        console.log('Rätt svar! Bra jobbat!');
      } else {
        console.log(`Tyvärr, fel svar. Rätt svar var ${answer}.`);
      }
      askQuestion(); // Ställ en ny fråga
    });
  }

  askQuestion();
}

if (require.main === module) {
  initTerminalGame();
}

