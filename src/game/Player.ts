import { Mesh, SphereGeometry, MeshStandardMaterial, CanvasTexture } from 'three';
import { PLAYER_CONSTANTS } from './constants';
import { PlayerLogic } from './PlayerLogic';
import { Position3D, Direction } from './types';

export class Player {
  private mesh: Mesh;
  private logic: PlayerLogic;
  private animating = false;

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
    const sphereMaterial = new MeshStandardMaterial({
      map: texture,
      color: PLAYER_CONSTANTS.TEXTURE.COLORS.PRIMARY,
      roughness: 0.4,
      metalness: 0.1,
    });

    const mesh = new Mesh(sphereGeometry, sphereMaterial);
    mesh.castShadow = true;
    return mesh;
  }

  private updateMeshPosition(): void {
    const position = this.logic.getCurrentPosition();
    this.mesh.position.set(position.x, position.y, position.z);
  }

  /** Smoothly animate the mesh from current visual position to the logic position */
  private tweenToLogicPosition(): void {
    const target = this.logic.getCurrentPosition();
    const startX = this.mesh.position.x;
    const startZ = this.mesh.position.z;
    const dx = target.x - startX;
    const dz = target.z - startZ;
    const duration = PLAYER_CONSTANTS.MOVE_DURATION;
    const start = performance.now();
    this.animating = true;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic: 1 - (1-t)^3
      const ease = 1 - Math.pow(1 - t, 3);
      this.mesh.position.x = startX + dx * ease;
      this.mesh.position.z = startZ + dz * ease;
      // roll the sphere
      this.mesh.rotation.x += (dz !== 0 ? Math.sign(dz) : 0) * 0.15;
      this.mesh.rotation.z -= (dx !== 0 ? Math.sign(dx) : 0) * 0.15;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        this.mesh.position.set(target.x, target.y, target.z);
        this.animating = false;
      }
    };
    requestAnimationFrame(step);
  }

  public getMesh(): Mesh {
    return this.mesh;
  }

  public move(direction: Direction): void {
    this.logic.move(direction);
    this.tweenToLogicPosition();
  }

  public resetPosition(): void {
    this.logic.resetPosition();
    this.updateMeshPosition(); // snap back instantly on wrong answer
  }

  public getMazePosition(): { x: number; z: number } {
    return this.logic.getMazePosition();
  }
}
