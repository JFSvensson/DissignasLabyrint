import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

export class TextureFactory {
  public static createBrickTexture(
    color = '#7744aa',
    groutColor = '#332255',
    width = 128,
    height = 128
  ): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Grout background
    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, width, height);

    const brickW = width / 4;
    const brickH = height / 4;
    const grout = 2;

    for (let row = 0; row < 4; row++) {
      const offset = row % 2 === 0 ? 0 : brickW / 2;
      for (let col = -1; col < 5; col++) {
        const x = col * brickW + offset;
        const y = row * brickH;

        // Slight color variation per brick
        const variation = (Math.random() - 0.5) * 20;
        ctx.fillStyle = TextureFactory.adjustBrightness(color, variation);
        ctx.fillRect(x + grout, y + grout, brickW - grout * 2, brickH - grout * 2);
      }
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }

  public static createFloorTexture(
    tileColor1 = '#1a1a2e',
    tileColor2 = '#24243a',
    width = 128,
    height = 128
  ): CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const tileSize = width / 4;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? tileColor1 : tileColor2;
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(width, i * tileSize);
      ctx.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }

  private static adjustBrightness(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `rgb(${r|0},${g|0},${b|0})`;
  }
}
