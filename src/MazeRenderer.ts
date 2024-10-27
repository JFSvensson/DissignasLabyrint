import * as THREE from 'three';

export class MazeRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private maze: number[][];

  constructor(containerId: string, maze: number[][]) {
    this.maze = maze;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(containerId)?.appendChild(this.renderer.domElement);

    this.initMaze();
    this.camera.position.set(this.maze.length / 2, 5, this.maze[0].length / 2);
    this.camera.lookAt(this.maze.length / 2, 0, this.maze[0].length / 2);

    this.animate();
  }

  private initMaze() {
    const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    for (let i = 0; i < this.maze.length; i++) {
      for (let j = 0; j < this.maze[i].length; j++) {
        if (this.maze[i][j] === 1) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.position.set(i, 0.5, j);
          this.scene.add(wall);
        }
      }
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}

