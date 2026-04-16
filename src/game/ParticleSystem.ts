import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Scene,
  AdditiveBlending,
} from 'three';

interface ParticleBurst {
  points: Points;
  velocities: Float32Array;
  life: number;
  maxLife: number;
  gravity: number;
}

export class ParticleSystem {
  private readonly scene: Scene;
  private bursts: ParticleBurst[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public emit(
    x: number,
    y: number,
    z: number,
    count: number,
    color: number,
    duration = 1.5,
    gravity = 2.0
  ): void {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 1.5 + Math.random() * 2.5;
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.abs(Math.cos(phi)) * speed * 1.2;
      velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    const material = new PointsMaterial({
      color,
      size: 0.08,
      transparent: true,
      opacity: 1.0,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    const points = new Points(geometry, material);
    this.scene.add(points);

    this.bursts.push({
      points,
      velocities,
      life: 0,
      maxLife: duration,
      gravity,
    });
  }

  public emitConfetti(x: number, y: number, z: number): void {
    const confettiColors = [0xffd700, 0xff4444, 0x44ff44, 0x4488ff, 0xff44ff, 0xff8800];
    confettiColors.forEach(color => {
      this.emit(x, y, z, 30, color, 2.0, 1.5);
    });
  }

  public update(dt: number): void {
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const burst = this.bursts[i];
      burst.life += dt;

      if (burst.life >= burst.maxLife) {
        this.scene.remove(burst.points);
        burst.points.geometry.dispose();
        (burst.points.material as PointsMaterial).dispose();
        this.bursts.splice(i, 1);
        continue;
      }

      const positions = burst.points.geometry.attributes.position;
      const arr = positions.array as Float32Array;
      const count = arr.length / 3;

      for (let j = 0; j < count; j++) {
        const j3 = j * 3;
        arr[j3] += burst.velocities[j3] * dt;
        arr[j3 + 1] += burst.velocities[j3 + 1] * dt;
        arr[j3 + 2] += burst.velocities[j3 + 2] * dt;

        // Gravity
        burst.velocities[j3 + 1] -= burst.gravity * dt;
      }
      positions.needsUpdate = true;

      // Fade out
      const progress = burst.life / burst.maxLife;
      (burst.points.material as PointsMaterial).opacity = 1.0 - progress;
    }
  }

  public dispose(): void {
    this.bursts.forEach(burst => {
      this.scene.remove(burst.points);
      burst.points.geometry.dispose();
      (burst.points.material as PointsMaterial).dispose();
    });
    this.bursts = [];
  }
}
