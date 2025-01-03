import { Operation } from './Operation';

export class Addition implements Operation {
    calculate(a: number, b: number): number {
        return a + b;
    }

    formatQuestion(a: number, b: number): string {
        return `${a} + ${b}`;
    }

    generateNumbers(max: number): [number, number] {
        if (max <= 0) {
            throw new Error('Max value must be a positive number');
        }
        const a = Math.floor(Math.random() * max);
        const b = Math.floor(Math.random() * max);
        return [a, b];
    }
}
