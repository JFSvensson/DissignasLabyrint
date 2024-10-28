import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  FontLoader,
  TextGeometry
} from './utils/three';

export class MazeRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private maze: number[][];
  private player!: Mesh;
  private questionText: Mesh | null = null;

  constructor(containerId: string, maze: number[][]) {
    this.maze = maze;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(containerId)?.appendChild(this.renderer.domElement);

    this.initMaze();
    this.initPlayer();
    this.initQuestionText();

    this.camera.position.set(this.maze.length / 2, 5, this.maze[0].length + 5);
    this.camera.lookAt(this.maze.length / 2, 0, this.maze[0].length / 2);

    this.animate();
  }

  private initMaze() {
    const wallGeometry = new BoxGeometry(1, 1, 1);
    const wallMaterial = new MeshBasicMaterial({ color: 0x00ff00 });

    for (let i = 0; i < this.maze.length; i++) {
      for (let j = 0; j < this.maze[i].length; j++) {
        if (this.maze[i][j] === 1) {
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(i, 0.5, j);
          this.scene.add(wall);
        }
      }
    }
  }

  private initPlayer() {
    const playerGeometry = new SphereGeometry(0.3, 32, 32);
    const playerMaterial = new MeshBasicMaterial({ color: 0xff0000 });
    this.player = new Mesh(playerGeometry, playerMaterial);
    this.player.position.set(1, 0.3, 1);
    this.scene.add(this.player);
  }

  private initQuestionText() {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const textGeometry = new TextGeometry('', {
        font: font,
        size: 0.5,
        depth: 0.1,
      });
      const textMaterial = new MeshBasicMaterial({ color: 0xffffff });
      this.questionText = new Mesh(textGeometry, textMaterial);
      this.questionText.position.set(this.maze.length / 2, 2, this.maze[0].length / 2);
      this.scene.add(this.questionText);
    });
  }

  public updateQuestionText(question: string) {
    if (this.questionText) {
      const geometry = this.questionText.geometry as TextGeometry;
      const font = geometry.parameters.options.font;
      const textGeometry = new TextGeometry(question, {
        font: font,
        size: 0.5,
        height: 0.1,
      });
      this.questionText.geometry.dispose();
      this.questionText.geometry = textGeometry;
    }
  }

  public movePlayer() {
    if (this.player.position.z < this.maze[0].length - 2) {
      this.player.position.z += 1;
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
