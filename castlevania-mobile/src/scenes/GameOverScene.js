export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOver' }); }

  create(data = {}) {
    const W = this.scale.width;
    const H = this.scale.height;
    const score = data.score || 0;

    this.cameras.main.setBackgroundColor(0x000000);

    this.add.text(W / 2, H * 0.3, 'GAME OVER', {
      fontSize: '30px', fontFamily: 'monospace',
      color: '#cc2200', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.48, `Final Score: ${score.toLocaleString()}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffdd88'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.6, 'The darkness has claimed you...', {
      fontSize: '10px', fontFamily: 'monospace', color: '#664444'
    }).setOrigin(0.5);

    const retry = this.add.text(W / 2, H * 0.74, '[ PRESS ANY KEY / TAP TO RETRY ]', {
      fontSize: '11px', fontFamily: 'monospace', color: '#4488cc',
      stroke: '#000', strokeThickness: 1
    }).setOrigin(0.5);

    this.tweens.add({
      targets: retry, alpha: { from: 1, to: 0.2 }, yoyo: true, repeat: -1, duration: 700
    });

    this.input.once('pointerdown', () => this.scene.start('Menu'));
    this.input.keyboard.once('keydown', () => this.scene.start('Menu'));
  }
}
