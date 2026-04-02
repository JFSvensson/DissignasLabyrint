import { Addition } from '../../src/operations/Addition';
import { Subtraction } from '../../src/operations/Subtraction';
import { Multiplication } from '../../src/operations/Multiplication';
import { Division } from '../../src/operations/Division';
import { Modulo } from '../../src/operations/Modulo';
import { Power } from '../../src/operations/Power';

describe('Operation Interface', () => {
  const operations = [
    { name: 'Addition', op: new Addition() },
    { name: 'Subtraction', op: new Subtraction() },
    { name: 'Multiplication', op: new Multiplication() },
    { name: 'Division', op: new Division() },
    { name: 'Modulo', op: new Modulo() },
    { name: 'Power', op: new Power() }
  ];

  test.each(operations)('$name should implement required methods', ({ op }) => {
    expect(op.calculate).toBeDefined();
    expect(op.formatQuestion).toBeDefined();
    expect(op.generateNumbers).toBeDefined();
  });
}); 