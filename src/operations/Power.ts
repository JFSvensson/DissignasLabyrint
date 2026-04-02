import { Operation } from './Operation';

export class Power implements Operation {
    calculate(a: number, b: number): number {
        return Math.pow(a, b);
    }

    formatQuestion(a: number, b: number): string {
        return `${a}^${b}`;
    }

    generateNumbers(max: number): [number, number] {
        // Keep bases small to avoid huge results
        const maxBase = Math.min(max, 10);
        const a = Math.floor(Math.random() * maxBase) + 1;
        // Exponent 2 or 3
        const b = Math.random() < 0.7 ? 2 : 3;
        return [a, b];
    }

    getName(): string {
        return 'math.operations.power';
    }
}
