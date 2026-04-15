import { 
  Scene, 
  PerspectiveCamera, 
  WebGLRenderer, 
  Mesh, 
  BoxGeometry, 
  MeshStandardMaterial,
  MeshBasicMaterial,
  AmbientLight,
  DirectionalLight,
  Vector3,
  Group,
} from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { MazeLogic } from './MazeLogic';
import { MazeQuestion } from './types';
import { MAZE_COLORS, MAZE_VISUAL } from './constants';
import { PowerUp } from './PowerUpManager';
import { PowerUpVisualManager } from './PowerUpVisualManager';

export class MazeRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private mazeLogic: MazeLogic;
  private questionText: Mesh | null = null;

  private static disposeMesh(mesh: Mesh): void {
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose());
    } else {
      mesh.material.dispose();
    }
  }
  private font: unknown = null;
  private onQuestionsUpdated: ((questions: MazeQuestion[]) => void) | null = null;
  private maze: Group;
  private visitedCells: Map<string, Mesh> = new Map();
  private mazeLayout: number[][] = [];
  private powerUpVisuals: PowerUpVisualManager;
  private resizeHandler: () => void;
  private animationFrameId: number = 0;

  constructor(containerId: string, mazeLayout: number[][], mazeLogic: MazeLogic) {
    this.scene = new Scene();
    this.powerUpVisuals = new PowerUpVisualManager(this.scene);
    
    // Beräkna aspect ratio baserat på container-storlek
    const container = document.getElementById(containerId);
    const aspect = container ? container.clientWidth / container.clientHeight : window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(50, aspect, 0.1, 1000);
    
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(
        container ? container.clientWidth : window.innerWidth,
        container ? container.clientHeight : window.innerHeight
    );
    
    // Lägg till event listener för window resize
    this.resizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.resizeHandler);
    
    container?.appendChild(this.renderer.domElement);

    // Lighting
    const ambient = new AmbientLight(MAZE_COLORS.AMBIENT_LIGHT, 0.6);
    this.scene.add(ambient);
    const sun = new DirectionalLight(MAZE_COLORS.DIRECTIONAL_LIGHT, 0.8);
    sun.position.set(mazeLayout.length, mazeLayout.length * 1.5, mazeLayout[0].length * 0.5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    const shadowExtent = Math.max(mazeLayout.length, mazeLayout[0].length);
    sun.shadow.camera.left = -shadowExtent;
    sun.shadow.camera.right = shadowExtent;
    sun.shadow.camera.top = shadowExtent;
    sun.shadow.camera.bottom = -shadowExtent;
    this.scene.add(sun);

    this.mazeLogic = mazeLogic;
    this.mazeLayout = mazeLayout;
    this.scene.add(this.mazeLogic.getPlayer().getMesh());

    this.maze = new Group();
    this.maze.rotation.y = Math.PI / 2;  // Rotera 90 grader moturs
    this.scene.add(this.maze);

    // Lyssna på händelser från MazeLogic
    this.mazeLogic.on('directionsUpdated', (questions: MazeQuestion[]) => {
      this.updateDirectionQuestions(questions);
      this.markCurrentCellVisited();
    });

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
    // Väggmaterial — lit
    const wallMaterial = new MeshStandardMaterial({ 
      color: MAZE_COLORS.WALL,
      roughness: 0.7,
      metalness: 0.1,
    });

    // Rutnätsmaterial — basic (wireframe)
    const gridMaterial = new MeshBasicMaterial({
      color: MAZE_COLORS.GRID,
      wireframe: true,
      transparent: true,
      opacity: MAZE_VISUAL.GRID_OPACITY,
    });

    // Skapa golvet
    const floorGeometry = new BoxGeometry(mazeLayout.length, 0.1, mazeLayout[0].length);
    const floorMaterial = new MeshStandardMaterial({ 
      color: MAZE_COLORS.FLOOR,
      roughness: 0.9,
      metalness: 0.0,
    });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.position.set(
      mazeLayout.length/2 - 0.5, 
      MAZE_VISUAL.FLOOR_Y,
      mazeLayout[0].length/2 - 0.5
    );
    this.scene.add(floor);

    // Lägg till rutnät + väggar
    for (let x = 0; x < mazeLayout.length; x++) {
      for (let z = 0; z < mazeLayout[x].length; z++) {
        const gridGeometry = new BoxGeometry(1, 0.1, 1);
        const gridCell = new Mesh(gridGeometry, gridMaterial);
        gridCell.position.set(x, 0.01, z);
        this.scene.add(gridCell);

        if (mazeLayout[x][z] === 1) {
          const wallGeometry = new BoxGeometry(0.9, MAZE_VISUAL.WALL_HEIGHT, 0.9);
          const wall = new Mesh(wallGeometry, wallMaterial);
          wall.castShadow = true;
          wall.receiveShadow = true;
          wall.position.set(x, MAZE_VISUAL.WALL_HEIGHT / 2, z);
          this.scene.add(wall);
        }
      }
    }

    // Goal marker (golden)
    const goalPos = this.mazeLogic.getGoalPosition();
    const goalGeometry = new BoxGeometry(0.8, MAZE_VISUAL.GOAL_HEIGHT, 0.8);
    const goalMaterial = new MeshStandardMaterial({ 
      color: MAZE_COLORS.GOAL,
      roughness: 0.3,
      metalness: 0.6,
      emissive: MAZE_COLORS.GOAL,
      emissiveIntensity: 0.3,
    });
    const goalMarker = new Mesh(goalGeometry, goalMaterial);
    goalMarker.position.set(goalPos.x, MAZE_VISUAL.GOAL_HEIGHT / 2, goalPos.z);
    this.scene.add(goalMarker);

    
    // X-axelns markeringar
    for (let x = 0; x < mazeLayout.length; x++) {
      const gridLine = new Mesh(
        new BoxGeometry(0.02, 0.1, mazeLayout[0].length),
        new MeshBasicMaterial({ 
          color: MAZE_COLORS.GRID_LINE,
          transparent: true,
          opacity: MAZE_VISUAL.GRID_LINE_OPACITY,
        })
      );
      gridLine.position.set(x, 0.05, mazeLayout[0].length/2 - 0.5);
      this.scene.add(gridLine);
    }

    // Z-axelns markeringar
    for (let z = 0; z < mazeLayout[0].length; z++) {
      const gridLine = new Mesh(
        new BoxGeometry(mazeLayout.length, 0.1, 0.02),
        new MeshBasicMaterial({ 
          color: MAZE_COLORS.GRID_LINE,
          transparent: true,
          opacity: MAZE_VISUAL.GRID_LINE_OPACITY,
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
        this.font = font;
        this.mazeLogic.updateAvailableDirections();
      },
      undefined,
      undefined
    );
  }

  private setupCamera(): void {
    // Dynamic camera position based on maze size
    const size = this.mazeLayout.length;
    const halfSize = size / 2;
    const cameraHeight = size * 1.4;
    this.camera.position.set(halfSize, cameraHeight, halfSize + size * 0.4);
    this.camera.lookAt(new Vector3(halfSize, 0, halfSize));
  }

  private markCurrentCellVisited(): void {
    const pos = this.mazeLogic.getPlayer().getMazePosition();
    const key = `${pos.x},${pos.z}`;
    if (this.visitedCells.has(key)) return;

    const visitedGeometry = new BoxGeometry(0.9, 0.02, 0.9);
    const visitedMaterial = new MeshStandardMaterial({
      color: MAZE_COLORS.VISITED,
      transparent: true,
      opacity: MAZE_VISUAL.VISITED_OPACITY,
      roughness: 0.8,
      metalness: 0.0,
    });
    const marker = new Mesh(visitedGeometry, visitedMaterial);
    marker.position.set(pos.x, 0.015, pos.z);
    this.scene.add(marker);
    this.visitedCells.set(key, marker);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.powerUpVisuals.animate();
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.resizeHandler);

    this.powerUpVisuals.dispose();

    this.visitedCells.forEach(mesh => {
      this.scene.remove(mesh);
      MazeRenderer.disposeMesh(mesh);
    });
    this.visitedCells.clear();

    if (this.questionText) {
      this.scene.remove(this.questionText);
      MazeRenderer.disposeMesh(this.questionText);
      this.questionText = null;
    }

    this.renderer.dispose();
  }

  private updateDirectionQuestions(questions: MazeQuestion[]): void {
    // Ta bort existerande text om den finns
    if (this.questionText) {
      this.scene.remove(this.questionText);
      MazeRenderer.disposeMesh(this.questionText);
      this.questionText = null;
    }

    // Uppdatera bara UI:n
    if (this.onQuestionsUpdated) {
      this.onQuestionsUpdated(questions);
    }
  }

  public getMazeLogic(): MazeLogic {
    return this.mazeLogic;
  }

  public setOnQuestionsUpdated(callback: (questions: MazeQuestion[]) => void): void {
    this.onQuestionsUpdated = callback;
    // Trigga initial uppdatering av riktningar
    this.mazeLogic.updateAvailableDirections();
  }

  public addPowerUps(powerUps: PowerUp[]): void {
    this.powerUpVisuals.add(powerUps);
  }

  public removePowerUpAt(x: number, z: number): void {
    this.powerUpVisuals.removeAt(x, z);
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
