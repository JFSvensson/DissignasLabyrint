import { Mesh, SphereGeometry, MeshBasicMaterial, CanvasTexture } from 'three';
import { PLAYER_CONSTANTS } from './constants';
import { PlayerLogic } from './PlayerLogic';
import { Position3D, Direction } from './types';

export class Player {
  private mesh: Mesh;
  private logic: PlayerLogic;

  constructor() {
    this.logic = new PlayerLogic({
      x: 1,
      y: PLAYER_CONSTANTS.START_POSITION.y,
      z: 1
    });

    this.mesh = this.createPlayerMesh();
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
    const position = this.logic.getCurrentPosition();
    this.mesh.position.set(position.x, position.y, position.z);
  }

  public getMesh(): Mesh {
    return this.mesh;
  }

  public move(direction: Direction): void {
    this.logic.move(direction);
    this.updateMeshPosition();
  }

  public resetPosition(): void {
    this.logic.resetPosition();
    this.updateMeshPosition();
  }

  public getMazePosition(): { x: number; z: number } {
    return this.logic.getMazePosition();
  }
}
