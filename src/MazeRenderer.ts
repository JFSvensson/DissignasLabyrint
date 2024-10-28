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

export class MazeRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private maze: number[][];
  private player!: Mesh;
  private questionText: Mesh | null = null;
  private font: any = null;

  constructor(containerId: string, maze: number[][], firstQuestion: string) {
    this.maze = maze;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(containerId)?.appendChild(this.renderer.domElement);

    this.initMaze();
    this.initPlayer();
    this.initQuestionText(firstQuestion);

    this.camera.position.set(this.maze.length / 2, 5, this.maze[0].length + 5);
    this.camera.lookAt(this.maze.length / 2, 0, this.maze[0].length / 2);

    this.animate();
  }

  private initMaze() {
    const wallMaterial = new MeshBasicMaterial({ 
      color: 0xffffff,  // Vit färg
      wireframe: true,  // Aktivera wireframe för vektor-stil
      wireframeLinewidth: 2  // Tjockare linjer
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
          
          // Lägg till kantlinjer
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

  private initPlayer() {
    // Skapa en canvas för att generera rutig textur
    const textureSize = 64;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Rita rutmönster
      const squareSize = 16; // Storleken på varje ruta
      context.fillStyle = '#ffffff'; // Vit bakgrund
      context.fillRect(0, 0, textureSize, textureSize);
      context.fillStyle = '#888888'; // Ljusgrå rutor
      
      for (let x = 0; x < textureSize; x += squareSize) {
        for (let y = 0; y < textureSize; y += squareSize) {
          if ((x + y) % (squareSize * 2) === 0) {
            context.fillRect(x, y, squareSize, squareSize);
          }
        }
      }
    }

    // Skapa textur från canvas
    const texture = new CanvasTexture(canvas);
    
    const sphereGeometry = new SphereGeometry(0.3, 32, 32);
    const sphereMaterial = new MeshBasicMaterial({ 
      map: texture,
      color: 0xffffff // Vit grundfärg
    });
    
    this.player = new Mesh(sphereGeometry, sphereMaterial);
    this.player.position.set(1, 0.3, 1);
    this.scene.add(this.player);
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
