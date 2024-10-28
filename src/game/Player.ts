import { Mesh, SphereGeometry, MeshBasicMaterial, CanvasTexture } from 'three';
import { PLAYER_CONSTANTS } from './constants';

export class Player {
  private mesh: Mesh;
  private previousPosition = { ...PLAYER_CONSTANTS.START_POSITION };

  constructor() {
    this.mesh = this.createPlayerMesh();
    this.mesh.position.set(
      PLAYER_CONSTANTS.START_POSITION.x,
      PLAYER_CONSTANTS.START_POSITION.y,
      PLAYER_CONSTANTS.START_POSITION.z
    );
  }

  private createPlayerMesh(): Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = PLAYER_CONSTANTS.TEXTURE.SIZE;
    canvas.height = PLAYER_CONSTANTS.TEXTURE.SIZE;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Rita bakgrund
      context.fillStyle = PLAYER_CONSTANTS.TEXTURE.COLORS.PRIMARY;
      context.fillRect(0, 0, PLAYER_CONSTANTS.TEXTURE.SIZE, PLAYER_CONSTANTS.TEXTURE.SIZE);
      
      // Rita rutmönster
      context.fillStyle = PLAYER_CONSTANTS.TEXTURE.COLORS.SECONDARY;
      for (let x = 0; x < PLAYER_CONSTANTS.TEXTURE.SIZE; x += PLAYER_CONSTANTS.TEXTURE.SQUARE_SIZE) {
        for (let y = 0; y < PLAYER_CONSTANTS.TEXTURE.SIZE; y += PLAYER_CONSTANTS.TEXTURE.SQUARE_SIZE) {
          if ((x + y) % (PLAYER_CONSTANTS.TEXTURE.SQUARE_SIZE * 2) === 0) {
            context.fillRect(x, y, PLAYER_CONSTANTS.TEXTURE.SQUARE_SIZE, PLAYER_CONSTANTS.TEXTURE.SQUARE_SIZE);
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

  public getMesh(): Mesh {
    return this.mesh;
  }

  public moveForward(): void {
    this.previousPosition = {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z
    };
    this.mesh.position.x += 1;
  }

  public resetPosition(): void {
    this.mesh.position.set(
      this.previousPosition.x,
      this.previousPosition.y,
      this.previousPosition.z
    );
  }
}
