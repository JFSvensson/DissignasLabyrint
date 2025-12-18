import { Operation } from './Operation';

export class Division implements Operation {
    calculate(a: number, b: number): number {
        return a / b;
    }

    formatQuestion(a: number, b: number): string {
        return `${a} ÷ ${b}`;
    }

    getName(): string {
        return 'math.operations.division';
    }

    generateNumbers(max: number): [number, number] {
        const b = Math.floor(Math.random() * (max/2)) + 1;
        
        const possibleMultiples = [];
        for (let i = 1; i <= max/b; i++) {
            possibleMultiples.push(b * i);
        }
        
        const randomIndex = Math.floor(Math.random() * possibleMultiples.length);
        const a = possibleMultiples[randomIndex];

        if (a > max || b > max || b === 0) {
            return [max, 1];
        }

        return [a, b];
    }

    private isValidDivision(a: number, b: number): boolean {
        return b !== 0 && a % b === 0;
    }
} 