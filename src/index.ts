import { MathQuestionGenerator } from './MathQuestionGenerator';
import { Addition } from './operations/Addition';
import * as readline from 'readline';

export function initGame() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const generator = new MathQuestionGenerator(new Addition());

  console.log('Välkommen till Dissignas labyrint!');
  console.log('Skriv "avsluta" när som helst för att avsluta spelet.');

  function askQuestion() {
    const { question, answer } = generator.generateQuestion();
    rl.question(`Vad är ${question}? `, (userAnswer) => {
      if (userAnswer.toLowerCase() === 'avsluta') {
        console.log('Tack för att du spelade! Hej då!');
        rl.close();
        process.exit(0);
      } else if (parseInt(userAnswer) === answer) {
        console.log('Rätt svar! Bra jobbat!');
      } else {
        console.log(`Tyvärr, fel svar. Rätt svar var ${answer}.`);
      }
      askQuestion(); // Ställ en ny fråga
    });
  }

  askQuestion();
}

// Kör spelet om filen körs direkt
if (require.main === module) {
  initGame();
}
