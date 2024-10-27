import MathQuestionGenerator from '../src/mathQuestions';

describe('MathQuestionGenerator', () => {
  let generator: MathQuestionGenerator;

  beforeEach(() => {
    generator = new MathQuestionGenerator();
  });

  test('should generate an addition question', () => {
    const { question, answer } = generator.generateAdditionQuestion();
    
    expect(question).toMatch(/^\d+ \+ \d+$/);
    expect(typeof answer).toBe('number');
    
    const [a, b] = question.split(' + ').map(Number);
    expect(a + b).toBe(answer);
  });
});

