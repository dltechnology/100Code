import { COLORS, BONE_DRAGON_HP, BONE_DRAGON_DAMAGE, BONE_DRAGON_SCORE,
  GIANT_SPIDER_HP, GIANT_SPIDER_DAMAGE, GIANT_SPIDER_SCORE } from '../utils/Constants.js';

// ──────────── Boss Base ────────────
class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp, damage, score) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setDepth(9);

    this.hp = hp;
    this.maxHp = hp;
    this.damage = damage;
    this.score = score;

    this._dead = false;
    this._hitFlash = 0;
    this._phase = 1;
    this._stateTimer = 0;
    this._state = 'idle';
    this._introDelay = 2000;
  }

  get isDead() { return this._dead; }

  takeDamage(amount) {
    if (this._dead) return;
    this.hp -= amount;
    this._hitFlash = 200;
    this.setTint(0xff2222);
    if (this.hp <= 0) this._die();
    this.scene.events.emit('bossDamaged', this.hp, this.maxHp);
    if (this.hp < this.maxHp * 0.4 && this._phase === 1) {
      this._phase = 2;
      this._onPhase2();
    }
  }

  _onPhase2() {}

  _die() {
    this._dead = true;
    this.body.enable = false;
    this.setTint(0x440000);
    // Explosion burst
    for (let i = 0; i < 12; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        if (!this.scene) return;
        const px = this.x + Phaser.Math.Between(-40, 40);
        const py = this.y + Phaser.Math.Between(-30, 30);
        this.scene.addExplosion(px, py);
      });
    }
    this.scene.time.delayedCall(1200, () => {
      this.scene.events.emit('bossDefeated');
      this.destroy();
    });
  }

  updateHitFlash(dt) {
    if (this._hitFlash > 0) {
      this._hitFlash -= dt;
      if (this._hitFlash <= 0) this.clearTint();
    }
  }
}

// ──────────── Bone Dragon (Level 1 boss) ────────────
export class BoneDragon extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'bone_dragon', BONE_DRAGON_HP, BONE_DRAGON_DAMAGE, BONE_DRAGON_SCORE);
    this.setScale(1.2);
    this.body.setSize(100, 60);
    this.body.setOffset(10, 10);
    this._attackTimer = 0;
    this._swoopDir = 1;
    this._startY = y;
    this._tailSegments = [];
    this._createTail(scene);
  }

  _createTail(scene) {
    for (let i = 0; i < 5; i++) {
      const seg = scene.add.graphics();
      seg.fillStyle(COLORS.SKELETON_DARK);
      seg.fillRect(-8, -8, 16, 16);
      seg.setDepth(8);
      this._tailSegments.push({ gfx: seg, x: this.x - i * 20, y: this.y, delay: i });
    }
  }

  update(dt, player) {
    if (this._dead) return;
    this.updateHitFlash(dt);

    if (this._introDelay > 0) {
      this._introDelay -= dt;
      this.setVelocity(0, 0);
      return;
    }

    this._stateTimer -= dt;
    this._attackTimer -= dt;

    switch (this._state) {
      case 'idle':
        this.setVelocityX(0);
        this._stateTimer = 800;
        this._state = 'swoop';
        break;

      case 'swoop':
        // Swoop across arena
        this.setVelocityX(this._swoopDir * (this._phase === 2 ? 320 : 220));
        this.setVelocityY(Math.sin(Date.now() * 0.003) * 80);
        if (this._stateTimer <= 0) {
          this._swoopDir *= -1;
          this._stateTimer = Phaser.Math.Between(2000, 3500);
          if (Math.random() < 0.5) this._state = 'dive';
        }
        break;

      case 'dive':
        // Dive toward player
        if (!player.isDead) {
          const dy = player.y - this.y;
          this.setVelocityY(dy > 0 ? 280 : -180);
          this.setVelocityX(this._swoopDir * 160);
        }
        if (this._stateTimer <= 0) {
          this._stateTimer = Phaser.Math.Between(1500, 2500);
          this._state = 'swoop';
        }
        break;
    }

    // Breath attack
    if (this._attackTimer <= 0) {
      this._breathAttack(player);
      this._attackTimer = this._phase === 2
        ? Phaser.Math.Between(1000, 1800)
        : Phaser.Math.Between(1800, 2800);
    }

    // Update tail
    this._tailSegments.forEach((seg, i) => {
      const lerp = 0.1 - i * 0.01;
      seg.x += (this.x - i * 22 * this._swoopDir - seg.x) * lerp;
      seg.y += (this.y - seg.y) * 0.1;
      seg.gfx.setPosition(seg.x, seg.y);
    });

    this.setFlipX(this.body.velocity.x < 0);
  }

  _breathAttack(player) {
    if (!player || player.isDead || !this.scene) return;
    const count = this._phase === 2 ? 5 : 3;
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 120, () => {
        if (!this.scene || this._dead) return;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const spread = Phaser.Math.DegToRad((i - Math.floor(count / 2)) * 15);
        const proj = this.scene.physics.add.image(this.x, this.y + 10, 'boss_projectile');
        proj.setDepth(7);
        proj.setData('damage', this.damage);
        this.scene.physics.velocityFromAngle(
          Phaser.Math.RadToDeg(angle + spread), 240, proj.body.velocity
        );
        proj.body.setAllowGravity(false);
        this.scene.bossProjectiles.add(proj);
        this.scene.time.delayedCall(2500, () => { if (proj.active) proj.destroy(); });
      });
    }
  }

  destroy() {
    this._tailSegments.forEach(s => s.gfx.destroy());
    super.destroy();
  }
}

// ──────────── Giant Spider (Level 2 boss) ────────────
export class GiantSpider extends Boss {
  constructor(scene, x, y) {
    super(scene, x, y, 'giant_spider', GIANT_SPIDER_HP, GIANT_SPIDER_DAMAGE, GIANT_SPIDER_SCORE);
    this.setScale(1.1);
    this.body.setSize(80, 60);
    this.body.setOffset(10, 10);
    this._attackTimer = 0;
    this._dropTimer = 0;
    this._webGroup = [];
    this._ceilingY = y - 140;
    this._floorY = y;
    this._onCeiling = false;
  }

  _onPhase2() {
    // Phase 2: move faster, drop webs more often
    this.speed = 180;
  }

  update(dt, player) {
    if (this._dead) return;
    this.updateHitFlash(dt);

    if (this._introDelay > 0) {
      this._introDelay -= dt;
      this.setVelocity(0, 0);
      return;
    }

    this._stateTimer -= dt;
    this._attackTimer -= dt;
    this._dropTimer -= dt;

    switch (this._state) {
      case 'idle':
        this._stateTimer = 600;
        this._state = 'walk';
        break;

      case 'walk':
        // Walk toward player on floor
        if (!player.isDead) {
          const dir = player.x > this.x ? 1 : -1;
          this.setVelocityX(dir * (this._phase === 2 ? 160 : 110));
          this.setFlipX(dir < 0);
        }
        if (this._stateTimer <= 0) {
          this._stateTimer = Phaser.Math.Between(2000, 3500);
          if (Math.random() < 0.4) this._state = 'climb';
        }
        break;

      case 'climb':
        // Rise to ceiling
        this.setVelocityX(0);
        this.setVelocityY(-200);
        if (this.y <= this._ceilingY + 10) {
          this.setVelocityY(0);
          this._onCeiling = true;
          this._stateTimer = Phaser.Math.Between(1500, 2500);
          this._state = 'ceiling_crawl';
        }
        break;

      case 'ceiling_crawl':
        // Crawl on ceiling toward player
        if (!player.isDead) {
          const dir = player.x > this.x ? 1 : -1;
          this.setVelocityX(dir * 130);
          this.setFlipX(dir < 0);
        }
        if (this._stateTimer <= 0) {
          this._state = 'drop';
        }
        break;

      case 'drop':
        // Drop onto player
        this._onCeiling = false;
        this.setVelocityX(0);
        this.setVelocityY(300);
        if (this.body.blocked.down) {
          this._state = 'walk';
          this._stateTimer = Phaser.Math.Between(2500, 4000);
        }
        break;
    }

    // Web drop attack
    if (this._dropTimer <= 0 && !player.isDead) {
      this._dropWeb(player);
      this._dropTimer = this._phase === 2
        ? Phaser.Math.Between(1200, 2000)
        : Phaser.Math.Between(2000, 3500);
    }

    // Charge spit when in range
    if (this._attackTimer <= 0 && !player.isDead) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (dist < 250) {
        this._spitVenom(player);
        this._attackTimer = Phaser.Math.Between(1500, 2500);
      }
    }
  }

  _dropWeb(player) {
    if (!this.scene) return;
    const web = this.scene.physics.add.image(player.x, this._onCeiling ? this.y : this.y - 20, 'spider_web');
    web.setDepth(6);
    web.setData('damage', this.damage * 0.5);
    web.setData('slow', true);
    this.scene.physics.velocityFromAngle(270, 200, web.body.velocity);
    this.scene.bossProjectiles.add(web);
    this.scene.time.delayedCall(3000, () => { if (web.active) web.destroy(); });
  }

  _spitVenom(player) {
    if (!this.scene || this._dead) return;
    const count = this._phase === 2 ? 4 : 2;
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const spread = Phaser.Math.DegToRad((i - (count - 1) / 2) * 18);
      const proj = this.scene.physics.add.image(this.x, this.y - 10, 'boss_projectile');
      proj.setDepth(7);
      proj.setTint(0x00ff44);
      proj.setData('damage', this.damage);
      this.scene.physics.velocityFromAngle(
        Phaser.Math.RadToDeg(angle + spread), 200, proj.body.velocity
      );
      proj.body.setAllowGravity(false);
      this.scene.bossProjectiles.add(proj);
      this.scene.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
    }
  }
}
