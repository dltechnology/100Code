import { BaseLevel } from './BaseLevel.js';
import { Ghost, MedusaHead, Bat } from '../entities/Enemy.js';
import { GiantSpider } from '../entities/Boss.js';
import { COLORS } from '../utils/Constants.js';

export class Level2Scene extends BaseLevel {
  constructor() {
    super('Level2');
    this.levelWidth = 3400;
    this.levelHeight = 600;
  }

  create(data = {}) {
    this._baseCreate(COLORS.CAVE_BG);
    this._carryOverData(data);
    this._drawBackground();
    this._placeHazards();
  }

  update(time, delta) {
    this._baseUpdate(time, delta);
    this._animateWater(time);
  }

  get _playerStart() { return { x: 60, y: 480 }; }
  get _bossTriggerX() { return 2800; }

  _carryOverData(data) {
    if (!data.score) return;
    this.player.score = data.score;
    this.player.souls = data.souls || 0;
    this.events.emit('scoreChanged', this.player.score);
    this.events.emit('soulCollected', this.player.souls);
  }

  _buildLevel() {
    // ── Cave floor ──
    this._placeTiles('cave', 0, 560, 3400, 16);

    // ── Entrance descent (0-700) ──
    this._placeTiles('cave', 64, 480, 128);
    this._placeTiles('cave', 240, 440, 96);
    this._placeTiles('cave', 380, 400, 64);
    this._placeTiles('cave', 480, 360, 96);
    this._placeTiles('cave', 620, 400, 96);
    this._placeTiles('cave', 760, 440, 64);

    // ── Underground river section (700-1400) water below ──
    this._placeTiles('cave', 840, 400, 96);
    this._placeTiles('cave', 980, 360, 64);
    this._placeTiles('cave', 1090, 400, 64);
    this._placeTiles('cave', 1200, 440, 96);
    this._placeTiles('cave', 1340, 400, 64);
    this._placeTiles('cave', 1440, 360, 96);
    this._placeTiles('cave', 1580, 320, 64);
    this._placeTiles('cave', 1680, 360, 64);
    this._placeTiles('cave', 1780, 400, 96);

    // ── Crystal cavern (1400-2200) ──
    this._placeTiles('cave_dark', 1900, 440, 128);
    this._placeTiles('cave_dark', 2080, 400, 96);
    this._placeTiles('cave_dark', 2220, 360, 64);
    this._placeTiles('cave_dark', 2340, 320, 96);
    this._placeTiles('cave_dark', 2480, 360, 128);
    this._placeTiles('cave_dark', 2640, 400, 96);

    // ── Spider's lair (2800-3400) ──
    this._placeTiles('cave_dark', 2800, 560, 600);
    // Platforms spider can cling to ceiling from
    this._placeTiles('cave_dark', 2850, 280, 400);  // ceiling ledge

    // Ceiling stalactites (decorative via graphics)
    this._drawStalactites();

    // Crystal decorations
    this._drawCrystals();

    this._spawnEnemies();
  }

  _drawBackground() {
    const W = this.levelWidth;
    const H = this.levelHeight;

    // Cave walls
    this._addBgRect(0, 0, W, H, COLORS.CAVE_BG);
    this._addBgRect(0, 0, W, 80, 0x000000, 0.9);  // dark ceiling

    // Cave wall texture
    for (let wx = 0; wx < W; wx += 80) {
      const shade = Phaser.Math.Between(0x110800, 0x221100);
      this._addBgRect(wx, 50, 76, H - 100, shade, 0.3);
    }

    // Bioluminescent glow patches
    const glowColors = [0x002244, 0x003322, 0x220033, 0x002200];
    for (let i = 0; i < 20; i++) {
      const gx = Phaser.Math.Between(0, W);
      const gy = Phaser.Math.Between(60, H - 80);
      const gc = Phaser.Utils.Array.GetRandom(glowColors);
      this.add.circle(gx, gy, Phaser.Math.Between(20, 60), gc, 0.25).setDepth(1);
    }

    // Spider lair: dark and ominous
    this._addBgRect(2780, 0, 620, H, 0x000000, 0.6);
    this.add.text(2950, 100, '— GIANT SPIDER —', {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#44ff44', stroke: '#000', strokeThickness: 2
    }).setDepth(4);
  }

  _drawStalactites() {
    const g = this.add.graphics().setDepth(3);
    for (let i = 0; i < 50; i++) {
      const sx = Phaser.Math.Between(0, this.levelWidth);
      const sh = Phaser.Math.Between(20, 70);
      const sw = Phaser.Math.Between(6, 18);
      g.fillStyle(0x221100, 0.9);
      g.fillTriangle(sx - sw / 2, 0, sx + sw / 2, 0, sx, sh);
      g.fillStyle(0x332211, 0.5);
      g.fillTriangle(sx - 2, 0, sx + 2, 0, sx, sh * 0.6);
    }
  }

  _drawCrystals() {
    const g = this.add.graphics().setDepth(3);
    const crystalColors = [0x0044aa, 0x004422, 0x440044, 0x002244];
    for (let i = 0; i < 30; i++) {
      const cx = Phaser.Math.Between(1400, 2700);
      const cy = Phaser.Math.Between(300, 520);
      const ch = Phaser.Math.Between(20, 50);
      const cw = Phaser.Math.Between(6, 14);
      const cc = Phaser.Utils.Array.GetRandom(crystalColors);
      g.fillStyle(cc, 0.8);
      g.fillTriangle(cx - cw / 2, cy + ch, cx + cw / 2, cy + ch, cx, cy);
      g.fillStyle(0xffffff, 0.15);
      g.fillTriangle(cx - 1, cy + ch, cx + 1, cy + ch, cx, cy + 4);
    }
  }

  _placeHazards() {
    // Underground river: water at bottom of pit zones
    this._waterTiles = [];
    const waterZones = [
      [700, 520, 500],   // river section
      [1300, 520, 300],
      [1900, 520, 200],
    ];
    waterZones.forEach(([wx, wy, ww]) => {
      const img = this.add.tileSprite(wx + ww / 2, wy, ww, 24, 'water').setDepth(2);
      this._waterTiles.push({ img, wx, wy, ww });
    });
  }

  _animateWater(time) {
    this._waterTiles.forEach(wt => {
      wt.img.setTilePosition(time * 0.04, 0);
    });
  }

  _spawnEnemies() {
    const ghostPositions = [
      [300, 380], [650, 340], [1100, 380], [1500, 360],
      [1800, 340], [2100, 360], [2400, 340], [2600, 380]
    ];
    ghostPositions.forEach(([x, y]) => {
      const g = new Ghost(this, x, y);
      this.enemies.push(g);
    });

    const medusaPositions = [
      [500, 280], [900, 260], [1200, 240], [1700, 280],
      [2000, 260], [2300, 240], [2500, 280]
    ];
    medusaPositions.forEach(([x, y]) => {
      const m = new MedusaHead(this, x, y);
      this.enemies.push(m);
    });

    const batPositions = [
      [200, 350], [750, 320], [1400, 300], [2200, 320]
    ];
    batPositions.forEach(([x, y]) => {
      const b = new Bat(this, x, y);
      this.enemies.push(b);
    });

    // Ground enemies need platform colliders
    this.enemies.forEach(e => {
      if (e.body && e.body.allowGravity) {
        this.physics.add.collider(e, this.platforms);
      }
    });
  }

  _checkHazards() {
    // Fell off world
    if (this.player.y > this.levelHeight - 10) {
      this.player.takeDamage(35, this.player.x);
      this.player.setPosition(Math.max(60, this.player.x - 80), 460);
      this.player.setVelocity(0, 0);
      return;
    }

    // Water damage
    this._waterTiles.forEach(wt => {
      if (this.player.x > wt.wx && this.player.x < wt.wx + wt.ww &&
          this.player.y > wt.wy - 8) {
        if (!this._waterDmgTimer || Date.now() - this._waterDmgTimer > 600) {
          this._waterDmgTimer = Date.now();
          this.player.takeDamage(8, this.player.x);
        }
      }
    });
  }

  _spawnBoss() {
    this._boss = new GiantSpider(this, 3100, 480);
    this.physics.add.collider(this._boss, this.platforms);
    this.events.emit('bossAppeared', 'GIANT SPIDER', this._boss.maxHp);
    this.cameras.main.shake(600, 0.018);

    // Seal the boss room
    const wall = this.platforms.create(2815, 420, 'cave_dark');
    wall.setDisplaySize(16, 160).refreshBody();
  }

  _onLevelComplete() {
    this.scene.stop('HUD');
    this.scene.start('Victory', { score: this.player.score, souls: this.player.souls });
  }
}
