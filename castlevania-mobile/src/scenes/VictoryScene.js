export class VictoryScene extends Phaser.Scene {
  constructor() { super({ key: 'Victory' }); }

  create(data = {}) {
    const W = this.scale.width;
    const H = this.scale.height;
    const score = data.score || 0;
    const souls = data.souls || 0;

    this.cameras.main.setBackgroundColor(0x000511);

    // Stars
    for (let i = 0; i < 80; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        2, 2, 0xffffff, Math.random() * 0.9 + 0.1
      );
    }

    // Title
    const title = this.add.text(W / 2, H * 0.2, 'YOU WIN!', {
      fontSize: '32px', fontFamily: 'monospace',
      color: '#ffdd00', stroke: '#884400', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(W / 2, H * 0.35, 'The castle has fallen.\nPeace returns to the land.', {
      fontSize: '11px', fontFamily: 'monospace',
      color: '#aaccee', align: 'center'
    }).setOrigin(0.5).setAlpha(0.9);

    // Stats
    const stats = [
      ['Final Score', score.toLocaleString()],
      ['Souls Collected', souls.toString()],
      ['Rank', this._rank(score)]
    ];
    stats.forEach(([label, val], i) => {
      this.add.text(W / 2 - 80, H * 0.52 + i * 22, label + ':', {
        fontSize: '12px', fontFamily: 'monospace', color: '#8899aa'
      }).setOrigin(0, 0.5);
      this.add.text(W / 2 + 80, H * 0.52 + i * 22, val, {
        fontSize: '12px', fontFamily: 'monospace', color: '#ffdd88'
      }).setOrigin(1, 0.5);
    });

    // Separator line
    this.add.rectangle(W / 2, H * 0.5, 220, 1, 0x445566);

    const btn = this.add.text(W / 2, H * 0.8, '[ PLAY AGAIN ]', {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#44aaff', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({ targets: title, alpha: 1, y: H * 0.2 - 10, duration: 1000, ease: 'Bounce' });
    this.tweens.add({
      targets: btn, alpha: { from: 1, to: 0.2 }, yoyo: true, repeat: -1, duration: 800, delay: 1000
    });

    this.input.once('pointerdown', () => this.scene.start('Menu'));
    this.input.keyboard.once('keydown', () => this.scene.start('Menu'));

    // Particle celebration
    const emitter = this.add.particles(W / 2, -10, 'particle', {
      x: { min: 0, max: W }, y: -10,
      speedY: { min: 80, max: 200 },
      scaleX: { min: 0.5, max: 2 }, scaleY: { min: 0.5, max: 2 },
      lifespan: 2500, quantity: 3, frequency: 80,
      tint: [0xffdd00, 0xff8800, 0x88ffff, 0xff4488, 0x44ff88]
    });
  }

  _rank(score) {
    if (score >= 15000) return 'S — DARK LORD';
    if (score >= 10000) return 'A — VAMPIRE HUNTER';
    if (score >= 6000) return 'B — BRAVE SOUL';
    if (score >= 3000) return 'C — ADVENTURER';
    return 'D — NOVICE';
  }
}
