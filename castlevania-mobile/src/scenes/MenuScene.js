import { COLORS } from '../utils/Constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000);

    // Starfield
    for (let i = 0; i < 60; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.6),
        2, 2, 0xffffff, Math.random() * 0.7 + 0.3
      );
    }

    // Moon
    this.add.circle(W * 0.8, 50, 28, COLORS.MOON);
    this.add.circle(W * 0.8 + 10, 46, 28, 0x000000);

    // Castle silhouette
    const g = this.add.graphics();
    g.fillStyle(0x110022, 1);
    const castle = [
      [0, H], [0, H * 0.55], [W * 0.12, H * 0.55], [W * 0.12, H * 0.4],
      [W * 0.15, H * 0.4], [W * 0.15, H * 0.32], [W * 0.17, H * 0.32],
      [W * 0.17, H * 0.28], [W * 0.2, H * 0.28], [W * 0.2, H * 0.32],
      [W * 0.22, H * 0.32], [W * 0.22, H * 0.4], [W * 0.25, H * 0.4],
      [W * 0.25, H * 0.52], [W * 0.4, H * 0.52], [W * 0.4, H * 0.38],
      [W * 0.42, H * 0.38], [W * 0.42, H * 0.3], [W * 0.44, H * 0.3],
      [W * 0.44, H * 0.25], [W * 0.46, H * 0.25], [W * 0.46, H * 0.3],
      [W * 0.48, H * 0.3], [W * 0.48, H * 0.38], [W * 0.5, H * 0.38],
      [W * 0.5, H * 0.52], [W * 0.65, H * 0.52], [W * 0.65, H * 0.42],
      [W * 0.68, H * 0.42], [W * 0.68, H * 0.35], [W * 0.72, H * 0.35],
      [W * 0.72, H * 0.42], [W * 0.75, H * 0.42], [W * 0.75, H * 0.55],
      [W, H * 0.55], [W, H]
    ];
    g.beginPath();
    castle.forEach(([cx, cy]) => g.lineTo(cx, cy));
    g.closePath();
    g.fillPath();

    // Torch windows
    [[W * 0.16, H * 0.38], [W * 0.43, H * 0.36], [W * 0.45, H * 0.34], [W * 0.69, H * 0.44]].forEach(([wx, wy]) => {
      this.add.rectangle(wx, wy, 6, 10, 0xff8800, 0.7);
    });

    // Title
    const title = this.add.text(W / 2, H * 0.15, 'SHADOW CASTLE', {
      fontSize: '26px', fontFamily: 'monospace',
      color: '#cc3300', stroke: '#000000', strokeThickness: 4,
      shadow: { x: 2, y: 2, color: '#ff6600', blur: 4, fill: true }
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.25, 'A Castlevania-style Adventure', {
      fontSize: '9px', fontFamily: 'monospace', color: '#886644'
    }).setOrigin(0.5);

    // Pulse title
    this.tweens.add({
      targets: title, scaleX: { from: 1, to: 1.04 }, scaleY: { from: 1, to: 1.04 },
      yoyo: true, repeat: -1, duration: 1200
    });

    // Menu options
    const menuY = H * 0.62;
    const startBtn = this._makeButton(W / 2, menuY, '▶  START GAME', 0xcc4422);
    const ctrlBtn = this._makeButton(W / 2, menuY + 40, '? CONTROLS', 0x224488);

    // Decorative bats
    this._bats = [];
    for (let i = 0; i < 5; i++) {
      const b = this.add.image(
        Phaser.Math.Between(20, W - 20),
        Phaser.Math.Between(40, H * 0.55),
        'bat'
      ).setScale(0.7).setAlpha(0.7);
      this._bats.push({ img: b, vx: Phaser.Math.FloatBetween(-30, 30), vy: Phaser.Math.FloatBetween(-10, 10) });
    }

    startBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(550, () => this.scene.start('Level1'));
    });

    ctrlBtn.on('pointerdown', () => this._showControls(W, H));

    // Keyboard start
    this.input.keyboard.on('keydown-ENTER', () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(550, () => this.scene.start('Level1'));
    });

    // Footer
    this.add.text(W / 2, H - 10, 'Arrow Keys / WASD  |  Z=Attack  X=Jump  |  Touch Controls', {
      fontSize: '7px', fontFamily: 'monospace', color: '#445566'
    }).setOrigin(0.5, 1);
  }

  update(time) {
    if (!this._bats) return;
    this._bats.forEach(b => {
      b.img.x += b.vx * 0.016;
      b.img.y += b.vy * 0.016 + Math.sin(time * 0.002 + b.img.x) * 0.3;
      b.img.setFlipX(b.vx < 0);
      if (b.img.x < -20) b.vx = Math.abs(b.vx);
      if (b.img.x > this.scale.width + 20) b.vx = -Math.abs(b.vx);
    });
  }

  _makeButton(x, y, label, color) {
    const bg = this.add.rectangle(x, y, 200, 32, color, 0.85).setInteractive().setOrigin(0.5);
    bg.setStrokeStyle(2, 0xffffff, 0.5);
    const txt = this.add.text(x, y, label, {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setInteractive();

    bg.on('pointerover', () => { bg.setFillStyle(color, 1); bg.setScale(1.05); txt.setScale(1.05); });
    bg.on('pointerout', () => { bg.setFillStyle(color, 0.85); bg.setScale(1); txt.setScale(1); });
    txt.on('pointerdown', () => bg.emit('pointerdown'));

    return bg;
  }

  _showControls(W, H) {
    const panel = this.add.rectangle(W / 2, H / 2, W * 0.85, H * 0.7, 0x000000, 0.95)
      .setStrokeStyle(2, 0x446688);
    const controls = [
      'CONTROLS',
      '',
      'Arrow Keys  —  Move',
      'Up / X      —  Jump (double jump!)',
      'Z           —  Attack',
      '',
      'Mobile: D-Pad + A/B buttons',
      '',
      'Collect hearts to restore HP',
      'Collect souls for power',
      'Defeat all bosses to win!',
      '',
      '[tap / press any key to close]'
    ];
    const texts = controls.map((line, i) =>
      this.add.text(W / 2, H / 2 - 100 + i * 16, line, {
        fontSize: i === 0 ? '14px' : '10px',
        fontFamily: 'monospace',
        color: i === 0 ? '#cc4422' : '#aabbcc',
        stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5)
    );
    const close = () => { panel.destroy(); texts.forEach(t => t.destroy()); };
    this.input.once('pointerdown', close);
    this.input.keyboard.once('keydown', close);
  }
}
