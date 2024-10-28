import { Mesh, SphereGeometry, MeshBasicMaterial, CanvasTexture, Vector3 } from 'three';
import { PLAYER_CONSTANTS } from './constants';

export class Player {
  private mesh: Mesh;
  private previousPosition = { ...PLAYER_CONSTANTS.START_POSITION };

  // Definiera riktningsvektorer som konstanter
  private static readonly DIRECTIONS = {
    FORWARD: new Vector3(0, 0, -1),  // Z-axel: negativ = framåt
    BACK: new Vector3(0, 0, 1),      // Z-axel: positiv = bakåt
    RIGHT: new Vector3(1, 0, 0),     // X-axel: positiv = höger
    LEFT: new Vector3(-1, 0, 0),     // X-axel: negativ = vänster
    UP: new Vector3(0, 1, 0),        // Y-axel: positiv = upp
    DOWN: new Vector3(0, -1, 0)      // Y-axel: negativ = ner
  };

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

  private savePreviousPosition(): void {
    this.previousPosition = {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z
    };
  }

  private move(direction: Vector3): void {
    this.savePreviousPosition();
    this.mesh.position.add(direction);
  }

  public moveForward(): void {
    this.move(Player.DIRECTIONS.FORWARD);
  }

  public moveBack(): void {
    this.move(Player.DIRECTIONS.BACK);
  }

  public moveRight(): void {
    this.move(Player.DIRECTIONS.RIGHT);
  }

  public moveLeft(): void {
    this.move(Player.DIRECTIONS.LEFT);
  }

  public moveUp(): void {
    this.move(Player.DIRECTIONS.UP);
  }

  public moveDown(): void {
    this.move(Player.DIRECTIONS.DOWN);
  }

  public resetPosition(): void {
    this.mesh.position.set(
      this.previousPosition.x,
      this.previousPosition.y,
      this.previousPosition.z
    );
  }
}
