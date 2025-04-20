import { Position3D, MazePosition, Direction } from './types';

export class PlayerLogic {
  private previousPosition: Position3D;
  private currentPosition: Position3D;

  constructor(startPosition: Position3D) {
    this.currentPosition = { ...startPosition };
    this.previousPosition = { ...startPosition };
  }

  public getMazePosition(): MazePosition {
    return {
      x: this.currentPosition.x,
      z: this.currentPosition.z
    };
  }

  public move(direction: Direction): void {
    this.previousPosition = { ...this.currentPosition };

    switch (direction) {
      case 'NORTH':
        this.currentPosition.z -= 1;
        break;
      case 'SOUTH':
        this.currentPosition.z += 1;
        break;
      case 'EAST':
        this.currentPosition.x += 1;
        break;
      case 'WEST':
        this.currentPosition.x -= 1;
        break;
    }
  }

  public resetPosition(): void {
    this.currentPosition = { ...this.previousPosition };
  }

  public getCurrentPosition(): Position3D {
    return this.currentPosition;
  }
}