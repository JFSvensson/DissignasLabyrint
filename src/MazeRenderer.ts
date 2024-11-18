import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  SphereGeometry,
  FontLoader,
  TextGeometry,
  LineBasicMaterial,
  LineSegments,
  EdgesGeometry,
  CanvasTexture
} from './utils/three';
import { Player } from './game/Player';

export class MazeRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private maze: number[][];
  private player!: Player;
  private questionText: Mesh | null = null;
  private font: any = null;
  private previousPosition = {
    x: 1,
    y: 0.3,
    z: 1
  };

  constructor(containerId: string, maze: number[][], firstQuestion: string) {
    this.maze = maze;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(containerId)?.appendChild(this.renderer.domElement);

    this.initMaze();
    this.player = new Player();
    this.scene.add(this.player.getMesh());
    this.initQuestionText(firstQuestion);

    this.camera.position.set(this.maze.length / 2, 5, this.maze[0].length + 5);
    this.camera.lookAt(this.maze.length / 2, 0, this.maze[0].length / 2);

    this.animate();
  }

  private initMaze() {
    const wallMaterial = new MeshBasicMaterial({ 
      color: 0xffffff,
      wireframe: true,
      wireframeLinewidth: 2
    });

    const edgeMaterial = new LineBasicMaterial({ 
      color: 0xffffff,
      linewidth: 2
    });

    for (let i = 0; i < this.maze.length; i++) {
      for (let j = 0; j < this.maze[i].length; j++) {
        if (this.maze[i][j] === 1) {
          const wallGeometry = new BoxGeometry(1, 2, 1);
          const wall = new Mesh(wallGeometry, wallMaterial);
          
          const edges = new EdgesGeometry(wallGeometry);
          const line = new LineSegments(edges, edgeMaterial);
          
          wall.position.set(i, 1, j);
          line.position.set(i, 1, j);
          
          this.scene.add(wall);
          this.scene.add(line);
        }
      }
    }
  }

  private initQuestionText(firstQuestion: string) {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      const textGeometry = new TextGeometry(firstQuestion, {
        font: font,
        size: 1.0,
        depth: 0.2,
      });
      const textMaterial = new MeshBasicMaterial({ color: 0xff0000 });
      this.questionText = new Mesh(textGeometry, textMaterial);
      this.questionText.position.set(
        this.maze.length / 2,
        3,
        this.maze[0].length / 2
      );
      this.questionText.rotation.x = -Math.PI / 4;
      this.scene.add(this.questionText);
    });
  }

  public updateQuestionText(question: string) {
    console.log('Uppdaterar text till:', question);
    if (!this.font) {
      console.error('Typsnitt är inte laddat.');
      return;
    }
    if (!this.questionText) {
      console.error('Frågan är inte laddad.');
      return;
    }

    try {
      const textGeometry = new TextGeometry(question, {
        font: this.font,
        size: 1.0,
        depth: 0.2,
      });
      this.questionText.geometry.dispose();
      this.questionText.geometry = textGeometry;
    } catch (error) {
      console.error('Fel vid uppdatering av text:', error);
    }
  }

  public movePlayer(): void {
    this.player.move('NORTH');
  }

  public resetPlayerPosition(): void {
    this.player.resetPosition();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
