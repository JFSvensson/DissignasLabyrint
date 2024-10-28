import { Mesh, SphereGeometry, MeshBasicMaterial, CanvasTexture } from 'three';

export class Player {
  private mesh: Mesh;
  private previousPosition = {
    x: 1,
    y: 0.3,
    z: 1
  };

  constructor() {
    this.mesh = this.createPlayerMesh();
    this.mesh.position.set(1, 0.3, 1);
  }

  private createPlayerMesh(): Mesh {
    const textureSize = 64;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d');
    
    if (context) {
      const squareSize = 16;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, textureSize, textureSize);
      context.fillStyle = '#cccccc';
      
      for (let x = 0; x < textureSize; x += squareSize) {
        for (let y = 0; y < textureSize; y += squareSize) {
          if ((x + y) % (squareSize * 2) === 0) {
            context.fillRect(x, y, squareSize, squareSize);
          }
        }
      }
    }

    const texture = new CanvasTexture(canvas);
    const sphereGeometry = new SphereGeometry(0.3, 32, 32);
    const sphereMaterial = new MeshBasicMaterial({ 
      map: texture,
      color: 0xffffff
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

