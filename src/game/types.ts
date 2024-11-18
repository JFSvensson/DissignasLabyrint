import { Vector3 } from 'three';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface MazePosition {
  x: number;
  z: number;
}

export type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

export interface MazeQuestion {
  question: string;
  answer: number;
  direction: Direction;
}

export interface MazeCell {
  position: MazePosition;
  questions: MazeQuestion[];
  isWall: boolean;
}
