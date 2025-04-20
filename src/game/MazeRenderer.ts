import { 
  Scene, 
  PerspectiveCamera, 
  WebGLRenderer, 
  Mesh, 
  BoxGeometry, 
  MeshBasicMaterial,
  Vector3,
  Group
} from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Player } from './Player';
import { PlayerLogic } from './PlayerLogic';
import { MazeLogic } from './MazeLogic';
import { Direction, MazeQuestion } from './types';
import { GameUI } from './UI';

export class MazeRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private player: Player;
  private mazeLogic: MazeLogic;
  private questionText: Mesh | null = null;
  private font: any = null;
  private ui: GameUI | null = null;  // Lägg till denna property
  private maze: Group;

  constructor(containerId: string, mazeLayout: number[][], mazeLogic: MazeLogic) {
    this.scene = new Scene();
    
    // Beräkna aspect ratio baserat på container-storlek
    const container = document.getElementById(containerId);
    const aspect = container ? container.clientWidth / container.clientHeight : window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(50, aspect, 0.1, 1000);
    
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(
        container ? container.clientWidth : window.innerWidth,
        container ? container.clientHeight : window.innerHeight
    );
    
    // Lägg till event listener för window resize
    window.addEventListener('resize', () => this.handleResize());
    
    container?.appendChild(this.renderer.domElement);

    this.mazeLogic = mazeLogic;  // Använd den delade instansen
    this.player = new Player();
    this.scene.add(this.player.getMesh());

    this.maze = new Group();
    this.maze.rotation.y = Math.PI / 2;  // Rotera 90 grader moturs
    this.scene.add(this.maze);

    this.loadFont().then(() => {
      this.initMaze(mazeLayout);
      this.initQuestionText();
      this.setupCamera();
      this.animate();
    });
  }

  private async loadFont(): Promise<void> {
    return new Promise((resolve) => {
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', 
        (font) => {
          this.font = font;
          resolve();
        }
      );
    });
  }

  private initMaze(mazeLayout: number[][]): void {
    // Väggmaterial
    const wallMaterial = new MeshBasicMaterial({ 
      color: 0x9757e3,
      wireframe: false
    });

    // Rutnätsmaterial
    const gridMaterial = new MeshBasicMaterial({
      color: 0x444444,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });

    // Skapa golvet först
    const floorGeometry = new BoxGeometry(mazeLayout.length, 0.1, mazeLayout[0].length);
    const floorMaterial = new MeshBasicMaterial({ 
      color: 0x333333,
      wireframe: false
    });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.position.set(
      mazeLayout.length/2 - 0.5, 
      -0.1,
      mazeLayout[0].length/2 - 0.5
    );
    this.scene.add(floor);

    // Lägg till rutnät
    for (let x = 0; x < mazeLayout.length; x++) {
      for (let z = 0; z < mazeLayout[x].length; z++) {
        // Skapa en rutnätsruta för varje position
        const gridGeometry = new BoxGeometry(1, 0.1, 1);
        const gridCell = new Mesh(gridGeometry, gridMaterial);
        gridCell.position.set(x, 0.01, z);  // Strax ovanför golvet
        this.scene.add(gridCell);

        // Om det är en vägg, lägg till väggmesh
        if (mazeLayout[x][z] === 1) {
          const wallGeometry = new BoxGeometry(0.9, 0.1, 0.9);  // Lite mindre än rutnätsrutan
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.position.set(x, 0.02, z);  // Strax ovanför rutnätet
          this.scene.add(wall);
        }
      }
    }

    // Förbättrade koordinatmarkeringar
    const textMaterial = new MeshBasicMaterial({ color: 0xffffff });
    const coordinateSize = 0.4;  // Större text
    
    // Skapa en container för koordinaterna
    const createCoordinateLabel = (text: string, position: Vector3, rotation: number = 0) => {
      const textGeometry = new TextGeometry(text, {
        font: this.font,
        size: coordinateSize,
        height: 0.01,
        curveSegments: 4,
        bevelEnabled: false
      });

      const label = new Mesh(textGeometry, textMaterial);
      label.position.copy(position);
      label.rotation.x = -Math.PI / 2;  // Lägg platt
      label.rotation.z = rotation;      // Rotera för läsbarhet
      
      // Centrera texten
      textGeometry.computeBoundingBox();
      const textWidth = textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x;
      label.position.x -= textWidth / 2;
      
      return label;
    };

    // X-axelns markeringar
    for (let x = 0; x < mazeLayout.length; x++) {
      // Rutnätslinjer
      const gridLine = new Mesh(
        new BoxGeometry(0.02, 0.1, mazeLayout[0].length),
        new MeshBasicMaterial({ 
          color: 0x666666,
          transparent: true,
          opacity: 0.3
        })
      );
      gridLine.position.set(x, 0.05, mazeLayout[0].length/2 - 0.5);
      this.scene.add(gridLine);
    }

    // Z-axelns markeringar
    for (let z = 0; z < mazeLayout[0].length; z++) {
      // Rutnätslinjer
      const gridLine = new Mesh(
        new BoxGeometry(mazeLayout.length, 0.1, 0.02),
        new MeshBasicMaterial({ 
          color: 0x666666,
          transparent: true,
          opacity: 0.3
        })
      );
      gridLine.position.set(mazeLayout.length/2 - 0.5, 0.05, z);
      this.scene.add(gridLine);
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
    this.camera.position.set(4, 13, 8);
    this.camera.lookAt(new Vector3(4, 0, 4));
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
    // Ta bort existerande text om den finns
    if (this.questionText) {
      this.scene.remove(this.questionText);
      this.questionText.geometry.dispose();
      
      if (Array.isArray(this.questionText.material)) {
        this.questionText.material.forEach(material => material.dispose());
      } else {
        this.questionText.material.dispose();
      }
      this.questionText = null;
    }

    // Uppdatera bara UI:n
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

  private handleResize(): void {
    const container = document.getElementById('maze-container');
    if (container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
  }
}
