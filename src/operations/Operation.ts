export interface Operation {
    calculate(a: number, b: number): number;
    formatQuestion(a: number, b: number): string;
    generateNumbers(max: number): [number, number];
    getName(): string; // Returns the translation key for the operation name
} 