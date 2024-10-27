interface MathQuestion {
  question: string;
  answer: number;
}

class MathQuestionGenerator {
  generateAdditionQuestion(max: number = 10): MathQuestion {
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * max);
    return {
      question: `${a} + ${b}`,
      answer: a + b
    };
  }
}

export default MathQuestionGenerator;

