import { generateTextures } from '../utils/TextureFactory.js';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  create() {
    generateTextures(this);

    // Loading text
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const t = this.add.text(cx, cy, 'SHADOW CASTLE', {
      fontSize: '22px', fontFamily: 'monospace',
      color: '#cc4422', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    const sub = this.add.text(cx, cy + 30, 'Loading...', {
      fontSize: '12px', fontFamily: 'monospace', color: '#888888'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [t, sub], alpha: { from: 0, to: 1 }, duration: 600,
      onComplete: () => {
        this.time.delayedCall(600, () => this.scene.start('Menu'));
      }
    });
  }
}
