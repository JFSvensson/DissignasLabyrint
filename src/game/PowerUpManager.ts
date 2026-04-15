import { MazePosition, Direction } from './types';

export type PowerUpType = 'hint' | 'timeBonus' | 'scoreMultiplier';

export interface PowerUp {
  type: PowerUpType;
  position: MazePosition;
  collected: boolean;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remaining: number;  // answers remaining for scoreMultiplier
}

export class PowerUpManager {
  private powerUps: PowerUp[] = [];
  private activeMultiplier: ActivePowerUp | null = null;

  public placePowerUps(mazeLayout: number[][], count: number, startPosition: MazePosition = { x: 1, z: 1 }, goalPosition?: MazePosition): void {
    this.powerUps = [];
    this.activeMultiplier = null;
    const openCells: MazePosition[] = [];
    const goal = goalPosition ?? { x: mazeLayout.length - 2, z: mazeLayout[0].length - 2 };

    for (let x = 0; x < mazeLayout.length; x++) {
      for (let z = 0; z < mazeLayout[0].length; z++) {
        if (mazeLayout[x][z] === 0 &&
            !(x === startPosition.x && z === startPosition.z) &&
            !(x === goal.x && z === goal.z)) {
          openCells.push({ x, z });
        }
      }
    }

    // Shuffle and pick
    for (let i = openCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [openCells[i], openCells[j]] = [openCells[j], openCells[i]];
    }

    const types: PowerUpType[] = ['hint', 'timeBonus', 'scoreMultiplier'];
    const numToPlace = Math.min(count, openCells.length);
    for (let i = 0; i < numToPlace; i++) {
      this.powerUps.push({
        type: types[i % types.length],
        position: openCells[i],
        collected: false,
      });
    }
  }

  public getPowerUps(): PowerUp[] {
    return this.powerUps;
  }

  public getUncollectedPowerUps(): PowerUp[] {
    return this.powerUps.filter(p => !p.collected);
  }

  public collectAtPosition(position: MazePosition): PowerUp | null {
    const powerUp = this.powerUps.find(
      p => !p.collected && p.position.x === position.x && p.position.z === position.z
    );
    if (powerUp) {
      powerUp.collected = true;
      if (powerUp.type === 'scoreMultiplier') {
        this.activeMultiplier = { type: 'scoreMultiplier', remaining: 3 };
      }
      return powerUp;
    }
    return null;
  }

  public getScoreMultiplier(): number {
    if (this.activeMultiplier && this.activeMultiplier.remaining > 0) {
      return 2;
    }
    return 1;
  }

  public consumeMultiplierUse(): void {
    if (this.activeMultiplier && this.activeMultiplier.remaining > 0) {
      this.activeMultiplier.remaining--;
      if (this.activeMultiplier.remaining <= 0) {
        this.activeMultiplier = null;
      }
    }
  }

  public getActiveMultiplier(): ActivePowerUp | null {
    return this.activeMultiplier;
  }

  public getHintAnswer(questions: Array<{ direction: Direction; answer: number }>): { direction: Direction; answer: number } | null {
    if (questions.length === 0) return null;
    const idx = Math.floor(Math.random() * questions.length);
    return questions[idx];
  }
}
