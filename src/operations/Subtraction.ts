import { Operation } from './Operation';

export class Subtraction implements Operation {
    calculate(a: number, b: number): number {
        return a - b;
    }

    formatQuestion(a: number, b: number): string {
        return `${a} - ${b}`;
    }

    generateNumbers(max: number): [number, number] {
        const b = Math.floor(Math.random() * max);
        const a = Math.floor(Math.random() * max) + b; // Säkerställ positivt svar
        return [a, b];
    }
}
