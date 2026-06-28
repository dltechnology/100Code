import { BaseLevel } from './BaseLevel.js';
import { Skeleton, Bat } from '../entities/Enemy.js';
import { BoneDragon } from '../entities/Boss.js';
import { COLORS } from '../utils/Constants.js';

export class Level1Scene extends BaseLevel {
  constructor() {
    super('Level1');
    this.levelWidth = 3200;
    this.levelHeight = 540;
  }

  create() {
    this._baseCreate(COLORS.SKY_TOP);
    this._drawBackground();
    this.events.emit('bossAppeared_hide'); // clear from prev run
  }

  update(time, delta) {
    this._baseUpdate(time, delta);
  }

  get _playerStart() { return { x: 60, y: 400 }; }
  get _bossTriggerX() { return 2600; }

  _buildLevel() {
    // ── Ground floor ──
    this._placeTiles('stone', 0, 480, 3200);

    // ── Castle entrance area (0-600) ──
    this._placeTiles('stone', 64, 416, 160);  // small rise
    this._placeTiles('stone', 320, 384, 96);
    this._placeTiles('stone', 448, 352, 128);
    this._placeTiles('stone', 600, 416, 64);  // drop

    // ── Courtyard (600-1100) ──
    this._placeTiles('stone', 640, 352, 96);
    this._placeTiles('stone', 800, 320, 64);
    this._placeTiles('stone', 900, 352, 64);
    this._placeTiles('stone', 1000, 416, 128);
    this._placeTiles('stone', 1060, 352, 64);

    // ── Clock tower base (1100-1600) ──
    this._placeTiles('stone_dark', 1100, 448, 64);   // pit bridge
    this._placeTiles('stone_dark', 1200, 416, 96);
    this._placeTiles('stone_dark', 1340, 352, 64);
    this._placeTiles('stone_dark', 1440, 288, 96);
    this._placeTiles('stone_dark', 1580, 352, 96);
    this._placeTiles('stone_dark', 1680, 416, 64);
    this._placeTiles('stone_dark', 1780, 352, 64);
    this._placeTiles('stone_dark', 1880, 288, 128);

    // ── Inner castle approach (1600-2400) ──
    this._placeTiles('stone', 1600, 448, 128);
    this._placeTiles('stone', 1760, 416, 96);
    this._placeTiles('stone', 1900, 352, 128);
    this._placeTiles('stone', 2060, 416, 96);
    this._placeTiles('stone', 2200, 384, 64);
    this._placeTiles('stone', 2300, 448, 96);
    this._placeTiles('stone', 2420, 416, 96);
    this._placeTiles('stone', 2520, 352, 96);

    // ── Boss chamber (2600-3200) ──
    this._placeTiles('stone_dark', 2600, 480, 600);

    // Candles for decoration + hidden hearts
    const candleXs = [180, 420, 700, 950, 1150, 1500, 1820, 2100, 2350];
    candleXs.forEach(cx => {
      const platformY = this._platformYAt(cx) - 24;
      this.add.image(cx, platformY, 'candle').setDepth(3);
      this.add.image(cx, platformY, 'candle').setDepth(3).setTint(COLORS.TORCH_FIRE);
    });

    // Torches on walls
    const torchXs = [100, 350, 640, 900, 1100, 1400, 1700, 2000, 2300];
    torchXs.forEach(tx => {
      this.add.image(tx, 380, 'torch').setDepth(3);
      // Torch flicker light effect
      this._addBgRect(tx - 30, 340, 60, 80, COLORS.TORCH_FIRE, 0.04);
    });

    // Spawn enemies
    this._spawnEnemies();
  }

  _platformYAt(x) {
    // Rough lookup used for decoration placement
    const platforms = [
      [0, 480], [64, 416], [320, 384], [448, 352],
      [640, 352], [800, 320], [1200, 416], [1440, 288],
      [1900, 352], [2200, 384], [2600, 480]
    ];
    let best = 480;
    for (const [px, py] of platforms) {
      if (Math.abs(px - x) < 200) best = py;
    }
    return best;
  }

  _spawnEnemies() {
    const skeletonPositions = [
      [220, 400], [480, 330], [750, 300], [980, 420],
      [1250, 390], [1500, 330], [1750, 410], [2000, 330],
      [2150, 460], [2350, 420]
    ];
    skeletonPositions.forEach(([x, y]) => {
      const s = new Skeleton(this, x, y);
      this.enemies.push(s);
      this.physics.add.collider(s, this.platforms);
    });

    const batPositions = [
      [400, 280], [700, 250], [1050, 220], [1400, 240],
      [1700, 260], [2050, 240], [2300, 220]
    ];
    batPositions.forEach(([x, y]) => {
      const b = new Bat(this, x, y);
      this.enemies.push(b);
    });

    // Enemy collisions with platforms
    this.enemies.forEach(e => {
      if (e.body.allowGravity !== false) {
        this.physics.add.collider(e, this.platforms);
      }
    });
  }

  _drawBackground() {
    const W = this.levelWidth;
    const H = this.levelHeight;

    // Sky gradient layers
    this._addBgRect(0, 0, W, H * 0.4, COLORS.SKY_TOP);
    this._addBgRect(0, H * 0.2, W, H * 0.3, COLORS.SKY_MID, 0.7);
    this._addBgRect(0, H * 0.4, W, H * 0.6, COLORS.SKY_BOT, 0.5);

    // Moon
    this.add.circle(200, 60, 30, COLORS.MOON).setDepth(1);
    this.add.circle(215, 55, 30, COLORS.SKY_TOP).setDepth(1); // crescent

    // Distant castle silhouette
    const silhouette = [[0, 360], [80, 360], [80, 280], [100, 280], [100, 240],
      [120, 240], [120, 260], [160, 260], [160, 200], [180, 200], [180, 180],
      [200, 180], [200, 200], [240, 200], [240, 260], [280, 260], [280, 220],
      [300, 220], [300, 260], [360, 260], [360, 340], [400, 340], [400, 360]];
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x110022, 0.9);
    g.beginPath();
    g.moveTo(0, H);
    silhouette.forEach(([sx, sy]) => g.lineTo(sx, sy));
    g.lineTo(400, H);
    g.closePath();
    g.fillPath();

    // Stars
    for (let i = 0; i < 80; i++) {
      const sx = Phaser.Math.Between(0, W);
      const sy = Phaser.Math.Between(0, 180);
      const star = this.add.rectangle(sx, sy, 2, 2, 0xffffff, Math.random() * 0.8 + 0.2).setDepth(1);
    }

    // Castle wall texture (vertical stones)
    for (let wx = 0; wx < W; wx += 64) {
      this._addBgRect(wx, 340, 60, 140, 0x221133, 0.4);
      this._addBgRect(wx + 32, 360, 60, 120, 0x1a0d2a, 0.4);
    }

    // Window lights
    for (let wx = 100; wx < W; wx += 180) {
      this.add.rectangle(wx, 310, 16, 20, 0xffcc44, 0.6).setDepth(2);
      this.add.rectangle(wx + 80, 290, 16, 24, 0xff8800, 0.4).setDepth(2);
    }

    // Boss room: dark dramatic background
    this._addBgRect(2580, 0, 620, H, 0x000000, 0.7);
    this.add.text(2780, 80, '— BONE DRAGON —', {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#ff4400', stroke: '#000', strokeThickness: 2
    }).setDepth(4);
  }

  _spawnBoss() {
    this._boss = new BoneDragon(this, 2850, 380);
    this.physics.add.collider(this._boss, this.platforms);
    this.events.emit('bossAppeared', 'BONE DRAGON', this._boss.maxHp);
    this.cameras.main.shake(500, 0.015);

    // Boss room seal (player can't retreat easily)
    const wall = this.platforms.create(2610, 420, 'stone_dark');
    wall.setDisplaySize(16, 120).refreshBody();
  }

  _checkHazards() {
    // Pit detection: fell off bottom → damage and respawn to last safe x
    if (this.player.y > this.levelHeight - 20) {
      this.player.takeDamage(30, this.player.x);
      this.player.setPosition(Math.max(60, this.player.x - 100), 400);
      this.player.setVelocity(0, 0);
    }
  }

  _onLevelComplete() {
    this.scene.stop('HUD');
    this.scene.start('Level2', { score: this.player.score, souls: this.player.souls });
  }
}
