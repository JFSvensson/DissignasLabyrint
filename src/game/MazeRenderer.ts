import { 
  Scene, 
  PerspectiveCamera, 
  WebGLRenderer, 
  Mesh, 
  BoxGeometry, 
  MeshBasicMaterial,
  Vector3
} from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Player } from './Player';
import { MazeLogic } from './MazeLogic';
import { Direction, MazeQuestion } from './types';
import { GameUI } from './UI';  // Lägg till denna import

export class MazeRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private player: Player;
  private mazeLogic: MazeLogic;
  private questionText: Mesh | null = null;
  private font: any = null;
  private ui: GameUI | null = null;  // Lägg till denna property

  constructor(containerId: string, mazeLayout: number[][], mazeLogic: MazeLogic) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(containerId)?.appendChild(this.renderer.domElement);

    this.mazeLogic = mazeLogic;  // Använd den delade instansen
    this.player = new Player();
    this.scene.add(this.player.getMesh());

    this.initMaze(mazeLayout);
    this.initQuestionText();
    this.setupCamera();
    this.animate();
  }

  private initMaze(mazeLayout: number[][]): void {
    const wallMaterial = new MeshBasicMaterial({ 
      color: 0xffffff,
      wireframe: false
    });

    for (let x = 0; x < mazeLayout.length; x++) {
      for (let z = 0; z < mazeLayout[x].length; z++) {
        if (mazeLayout[x][z] === 1) {
          const wallGeometry = new BoxGeometry(1, 0.1, 1);
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(x, 0, z);
          this.scene.add(wall);
        }
      }
    }
  }

  private initQuestionText(): void {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', 
      (font) => {
        console.log('Font loaded successfully');
        this.font = font;
        this.updateAvailableDirections();
      },
      // Progress callback
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // Error callback
      (error) => {
        console.error('Error loading font:', error);
      }
    );
  }

  private setupCamera(): void {
    // Justera kamerans position för bättre överblick
    this.camera.position.set(5, 8, 8);
    this.camera.lookAt(new Vector3(2, 0, 2));
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  private updateAvailableDirections(): void {
    const currentPos = this.player.getMazePosition();
    const questions = this.mazeLogic.getQuestionsAtPosition(currentPos);
    console.log('Available questions:', questions);  // Debug log
    this.updateDirectionQuestions(questions);
  }

  private updateDirectionQuestions(questions: MazeQuestion[]): void {
    if (!this.font) {
      console.log('Font not loaded yet');
      return;
    }

    // Remove existing text if any
    if (this.questionText) {
      this.scene.remove(this.questionText);
      this.questionText.geometry.dispose();
      
      // Hantera material dispose korrekt
      if (Array.isArray(this.questionText.material)) {
        this.questionText.material.forEach(material => material.dispose());
      } else {
        this.questionText.material.dispose();
      }
    }

    const questionText = questions.map(q => 
      `${q.direction}: ${q.question}`
    ).join('\n');

    console.log('Creating text:', questionText);  // Debug log

    try {
      const textGeometry = new TextGeometry(questionText || 'No questions available', {
        font: this.font,
        size: 0.5,  // Större text
        depth: 0.1,
        curveSegments: 12,
        bevelEnabled: false
      });

      textGeometry.computeBoundingBox();
      const centerOffset = -(textGeometry.boundingBox?.max.x || 0) / 2;

      const textMaterial = new MeshBasicMaterial({ 
        color: 0xff0000,
        transparent: false,
        opacity: 1.0
      });

      this.questionText = new Mesh(textGeometry, textMaterial);
      
      // Placera texten framför spelaren
      const playerPos = this.player.getMazePosition();
      this.questionText.position.set(
        playerPos.x + centerOffset,
        3,  // Högre upp
        playerPos.z - 1
      );
      
      // Rotera texten så den är läsbar
      this.questionText.rotation.x = -Math.PI / 4;
      
      this.scene.add(this.questionText);
      console.log('Text added to scene');  // Debug log
    } catch (error) {
      console.error('Error creating text:', error);
    }

    // Uppdatera UI om den finns
    if (this.ui) {
      this.ui.updateQuestions(questions);
    }
  }

  public movePlayer(direction: Direction): void {
    this.player.move(direction);
    this.updateAvailableDirections();
  }

  public resetPlayerPosition(): void {
    this.player.resetPosition();
    this.updateAvailableDirections();
  }

  public getPlayer(): Player {
    return this.player;
  }

  public getMazeLogic(): MazeLogic {
    return this.mazeLogic;
  }

  public setUI(ui: GameUI): void {
    this.ui = ui;
    // Uppdatera UI:n med initiala frågor
    const currentPos = this.player.getMazePosition();
    const questions = this.mazeLogic.getQuestionsAtPosition(currentPos);
    this.updateDirectionQuestions(questions);
  }
}
