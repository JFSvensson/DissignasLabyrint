import { Mesh, SphereGeometry, MeshBasicMaterial, CanvasTexture, Vector3 } from 'three';
import { PLAYER_CONSTANTS } from './constants';
import { Position3D, MazePosition, Direction } from './types';

export class Player {
  private mesh: Mesh;
  private previousPosition: Position3D;
  private currentPosition: Position3D;

  private static readonly DIRECTION_VECTORS = {
    FORWARD: new Vector3(0, 0, -1),
    BACK: new Vector3(0, 0, 1),
    RIGHT: new Vector3(1, 0, 0),
    LEFT: new Vector3(-1, 0, 0)
  };

  constructor() {
    this.mesh = this.createPlayerMesh();
    this.currentPosition = {
      x: 1,
      y: PLAYER_CONSTANTS.START_POSITION.y,
      z: 1
    };
    this.previousPosition = { ...this.currentPosition };
    this.updateMeshPosition();
  }

  private createPlayerMesh(): Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = PLAYER_CONSTANTS.TEXTURE.SIZE;
    canvas.height = PLAYER_CONSTANTS.TEXTURE.SIZE;
    const context = canvas.getContext('2d');
    
    if (context) {
      const squareSize = PLAYER_CONSTANTS.TEXTURE.SQUARE_SIZE;
      context.fillStyle = PLAYER_CONSTANTS.TEXTURE.COLORS.PRIMARY;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = PLAYER_CONSTANTS.TEXTURE.COLORS.SECONDARY;
      
      for (let x = 0; x < canvas.width; x += squareSize) {
        for (let y = 0; y < canvas.height; y += squareSize) {
          if ((x + y) % (squareSize * 2) === 0) {
            context.fillRect(x, y, squareSize, squareSize);
          }
        }
      }
    }

    const texture = new CanvasTexture(canvas);
    const sphereGeometry = new SphereGeometry(PLAYER_CONSTANTS.SIZE, 32, 32);
    const sphereMaterial = new MeshBasicMaterial({ 
      map: texture,
      color: PLAYER_CONSTANTS.TEXTURE.COLORS.PRIMARY
    });
    
    return new Mesh(sphereGeometry, sphereMaterial);
  }

  private updateMeshPosition(): void {
    this.mesh.position.set(
      this.currentPosition.x,
      this.currentPosition.y,
      this.currentPosition.z
    );
  }

  public getMesh(): Mesh {
    return this.mesh;
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
    
    this.updateMeshPosition();
  }

  public resetPosition(): void {
    this.currentPosition = { ...this.previousPosition };
    this.updateMeshPosition();
  }
}
