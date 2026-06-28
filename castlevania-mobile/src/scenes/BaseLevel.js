import { Player } from '../entities/Player.js';
import { MobileControls } from '../ui/MobileControls.js';

// Shared logic for both levels (camera, collisions, combat, loot, HUD wiring).
export class BaseLevel extends Phaser.Scene {
  constructor(key) {
    super({ key });
    this.levelKey = key;
    this.levelWidth = 3200;
    this.levelHeight = 540;
  }

  // Subclasses call this in create()
  _baseCreate(bgColor) {
    this.cameras.main.setBackgroundColor(bgColor);
    this.physics.world.setBounds(0, 0, this.levelWidth, this.levelHeight);
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);

    // Groups
    this.platforms = this.physics.add.staticGroup();
    this.enemies = [];
    this.lootGroup = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.bossProjectiles = this.physics.add.group();
    this.decorGroup = this.add.group();

    // Build level (implemented in subclass)
    this._buildLevel();

    // Player
    this.player = new Player(this, this._playerStart.x, this._playerStart.y);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.lootGroup, this.platforms, (loot) => {
      loot.setVelocityX(loot.body.velocity.x * 0.4);
    });

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Controls
    this._cursors = this.input.keyboard.createCursorKeys();
    this._attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this._jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this._mobile = new MobileControls(this);

    // HUD
    if (!this.scene.isActive('HUD')) {
      this.scene.launch('HUD');
    }
    this.scene.get('HUD').events.emit('bindLevel', this.levelKey);

    // Boss area trigger
    this._bossTriggered = false;
    this._boss = null;

    // Level complete flag
    this._levelDone = false;

    // Events
    this.events.on('playerDied', this._onPlayerDied, this);
    this.events.on('bossDefeated', this._onBossDefeated, this);

    // Particle emitter reference
    this._particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 60, max: 160 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: 0,
      gravityY: 300
    });
  }

  addExplosion(x, y) {
    this._particles.setPosition(x, y);
    this._particles.explode(8);
  }

  _baseUpdate(time, delta) {
    if (this._levelDone) return;

    // Merge keyboard + touch
    const cursors = {
      left: { isDown: this._cursors.left.isDown || this._mobile.isLeftDown() },
      right: { isDown: this._cursors.right.isDown || this._mobile.isRightDown() },
      up: this._cursors.up
    };

    const jumpJD = Phaser.Input.Keyboard.JustDown(this._cursors.up)
      || Phaser.Input.Keyboard.JustDown(this._jumpKey)
      || this._mobile.isJumpJustDown();
    const attackJD = Phaser.Input.Keyboard.JustDown(this._attackKey)
      || this._mobile.isAttackJustDown();

    this.player.update(delta, cursors, attackJD, jumpJD);

    // Enemy updates + collision detection
    this._updateEnemiesAndCombat(delta);

    // Loot pickup
    this._checkLootPickup();

    // Boss trigger
    this._checkBossTrigger();

    // Hazards (subclass: water, lava)
    this._checkHazards();
  }

  _updateEnemiesAndCombat(delta) {
    const attackBounds = this.player.getAttackBounds();

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e || !e.active) { this.enemies.splice(i, 1); continue; }

      e.update(delta, this.player, this.platforms);

      // Sword hits enemy
      if (attackBounds && !e.isDead) {
        const eb = e.getBounds();
        if (Phaser.Geom.Rectangle.Overlaps(attackBounds, eb)) {
          e.takeDamage(this.player.attack);
          if (e.isDead) {
            this.player.addScore(e.score);
            this.addExplosion(e.x, e.y);
          }
        }
      }

      // Enemy body touches player
      if (!e.isDead && !this.player.isDead) {
        const pb = this.player.getBounds();
        const eb = e.getBounds();
        if (Phaser.Geom.Rectangle.Overlaps(pb, eb)) {
          this.player.takeDamage(e.damage, e.x);
        }
      }
    }

    // Boss combat
    if (this._boss && !this._boss.isDead) {
      this._boss.update(delta, this.player);

      if (attackBounds) {
        const bb = this._boss.getBounds();
        if (Phaser.Geom.Rectangle.Overlaps(attackBounds, bb)) {
          this._boss.takeDamage(this.player.attack);
        }
      }
      if (!this.player.isDead) {
        const pb = this.player.getBounds();
        const bb = this._boss.getBounds();
        if (Phaser.Geom.Rectangle.Overlaps(pb, bb)) {
          this.player.takeDamage(this._boss.damage, this._boss.x);
        }
      }
    }

    // Enemy projectiles
    this.enemyProjectiles.getChildren().forEach(proj => {
      if (!proj.active) return;
      const pb = this.player.getBounds();
      const prb = proj.getBounds();
      if (Phaser.Geom.Rectangle.Overlaps(pb, prb)) {
        this.player.takeDamage(proj.getData('damage') || 10, proj.x);
        proj.destroy();
      }
      // Sword kills projectile
      if (attackBounds && Phaser.Geom.Rectangle.Overlaps(attackBounds, prb)) {
        this.addExplosion(proj.x, proj.y);
        proj.destroy();
      }
    });

    // Boss projectiles
    this.bossProjectiles.getChildren().forEach(proj => {
      if (!proj.active) return;
      const pb = this.player.getBounds();
      const prb = proj.getBounds();
      if (Phaser.Geom.Rectangle.Overlaps(pb, prb)) {
        this.player.takeDamage(proj.getData('damage') || 18, proj.x);
        proj.destroy();
      }
    });
  }

  _checkLootPickup() {
    this.lootGroup.getChildren().forEach(loot => {
      if (!loot.active) return;
      const dist = Phaser.Math.Distance.Between(loot.x, loot.y, this.player.x, this.player.y);
      if (dist < 20) {
        const type = loot.getData('type');
        if (type === 'heart') {
          this.player.heal(25);
          this._showPickup(loot.x, loot.y, '+25 HP', '#ff6688');
        } else if (type === 'gold') {
          this.player.addScore(50);
          this._showPickup(loot.x, loot.y, '+50', '#ffdd44');
        } else if (type === 'soul') {
          this.player.collectSoul();
          this._showPickup(loot.x, loot.y, 'SOUL', '#88ffff');
        }
        loot.destroy();
      }
    });
  }

  _showPickup(x, y, text, color) {
    const t = this.add.text(x, y - 10, text, {
      fontSize: '8px', fontFamily: 'monospace',
      color, stroke: '#000', strokeThickness: 1
    }).setDepth(20).setOrigin(0.5);
    this.tweens.add({
      targets: t, y: y - 28, alpha: 0, duration: 900,
      onComplete: () => t.destroy()
    });
  }

  _checkBossTrigger() {
    if (this._bossTriggered) return;
    if (this.player.x >= this._bossTriggerX) {
      this._bossTriggered = true;
      this._spawnBoss();
    }
  }

  // Abstract – subclasses implement these:
  _buildLevel() {}
  _checkHazards() {}
  _spawnBoss() {}
  get _playerStart() { return { x: 60, y: 400 }; }
  get _bossTriggerX() { return this.levelWidth - 500; }

  _onPlayerDied() {
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.stop('HUD');
      this.scene.start('GameOver', { score: this.player.score });
    });
  }

  _onBossDefeated() {
    this.player.addScore(this._boss?.score || 2000);
    this._levelDone = true;
    this._showPickup(this.player.x, this.player.y - 20, 'VICTORY!', '#ffdd00');
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(800, 255, 255, 200);
      this.time.delayedCall(900, () => this._onLevelComplete());
    });
  }

  _onLevelComplete() {
    // Subclass overrides to go to next level or victory
  }

  // Utility: place a platform tile row
  _placeTiles(texture, x, y, w, h = 16) {
    for (let tx = 0; tx < w; tx += 32) {
      const tile = this.platforms.create(x + tx + 16, y + h / 2, texture);
      tile.setDisplaySize(32, h).refreshBody();
    }
  }

  // Utility: add decorative background elements
  _addBgRect(x, y, w, h, color, alpha = 1) {
    this.add.rectangle(x, y, w, h, color, alpha).setDepth(0).setOrigin(0, 0);
  }
}
