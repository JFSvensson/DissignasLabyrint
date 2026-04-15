import {
  Scene,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  OctahedronGeometry,
  ConeGeometry,
} from 'three';
import { PowerUp, PowerUpType } from './PowerUpManager';

export class PowerUpVisualManager {
  private readonly scene: Scene;
  private readonly meshes: Map<string, Mesh> = new Map();
  private animationTime: number = 0;

  private static readonly COLORS: Record<PowerUpType, number> = {
    hint: 0x00ccff,
    timeBonus: 0x00ff88,
    scoreMultiplier: 0xffaa00,
  };

  private static readonly EMISSIVE: Record<PowerUpType, number> = {
    hint: 0x0066aa,
    timeBonus: 0x008844,
    scoreMultiplier: 0xaa6600,
  };

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public add(powerUps: PowerUp[]): void {
    powerUps.forEach(pu => {
      const key = `${pu.position.x},${pu.position.z}`;
      const color = PowerUpVisualManager.COLORS[pu.type];
      const emissive = PowerUpVisualManager.EMISSIVE[pu.type];

      let geometry;
      switch (pu.type) {
        case 'hint':
          geometry = new OctahedronGeometry(0.2);
          break;
        case 'timeBonus':
          geometry = new SphereGeometry(0.2, 8, 8);
          break;
        case 'scoreMultiplier':
          geometry = new ConeGeometry(0.18, 0.35, 6);
          break;
      }

      const material = new MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.5,
      });

      const mesh = new Mesh(geometry, material);
      mesh.position.set(pu.position.x, 0.35, pu.position.z);
      this.scene.add(mesh);
      this.meshes.set(key, mesh);
    });
  }

  public removeAt(x: number, z: number): void {
    const key = `${x},${z}`;
    const mesh = this.meshes.get(key);
    if (mesh) {
      this.scene.remove(mesh);
      PowerUpVisualManager.disposeMesh(mesh);
      this.meshes.delete(key);
    }
  }

  public animate(): void {
    this.animationTime += 0.02;
    this.meshes.forEach(mesh => {
      mesh.position.y = 0.35 + Math.sin(this.animationTime * 2) * 0.08;
      mesh.rotation.y = this.animationTime;
    });
  }

  public dispose(): void {
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
      PowerUpVisualManager.disposeMesh(mesh);
    });
    this.meshes.clear();
  }

  private static disposeMesh(mesh: Mesh): void {
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose());
    } else {
      mesh.material.dispose();
    }
  }
}
