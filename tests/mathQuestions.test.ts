import { MathQuestionGenerator } from '../src/MathQuestionGenerator';
import { Addition } from '../src/operations/Addition';

describe('MathQuestionGenerator', () => {
  let generator: MathQuestionGenerator;

  beforeEach(() => {
    generator = new MathQuestionGenerator(new Addition());
  });

  test('should generate an addition question', () => {
    const { question, answer } = generator.generateQuestion();
    
    expect(question).toMatch(/^\d+ \+ \d+$/);
    expect(typeof answer).toBe('number');
    
    const [a, b] = question.split(' + ').map(Number);
    expect(a + b).toBe(answer);
  });

  test('should generate question with custom max value', () => {
    const max = 5;
    const { question, answer } = generator.generateQuestion(max);
    
    const [a, b] = question.split(' + ').map(Number);
    expect(a).toBeLessThan(max);
    expect(b).toBeLessThan(max);
  });
});
