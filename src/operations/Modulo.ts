import { Operation } from './Operation';

export class Modulo implements Operation {
    calculate(a: number, b: number): number {
        return a % b;
    }

    formatQuestion(a: number, b: number): string {
        return `${a} mod ${b}`;
    }

    generateNumbers(max: number): [number, number] {
        const b = Math.floor(Math.random() * Math.min(max / 2, 10)) + 2;
        const a = Math.floor(Math.random() * max) + b;
        return [a, b];
    }

    getName(): string {
        return 'math.operations.modulo';
    }
}
