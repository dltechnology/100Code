import { COLORS, SKELETON_HP, SKELETON_SPEED, SKELETON_DAMAGE, SKELETON_SCORE,
  BAT_HP, BAT_SPEED, BAT_DAMAGE, BAT_SCORE,
  GHOST_HP, GHOST_SPEED, GHOST_DAMAGE, GHOST_SCORE,
  MEDUSA_HP, MEDUSA_SPEED, MEDUSA_DAMAGE, MEDUSA_SCORE } from '../utils/Constants.js';

// Base enemy class – all enemies extend this.
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp, speed, damage, score) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setDepth(8);

    this.hp = hp;
    this.maxHp = hp;
    this.speed = speed;
    this.damage = damage;
    this.score = score;

    this._dead = false;
    this._hitFlash = 0;
    this._patrolDir = 1;
    this._patrolTimer = Phaser.Math.Between(1500, 3000);
    this._stateTimer = 0;
    this._state = 'patrol';
  }

  get isDead() { return this._dead; }

  takeDamage(amount) {
    if (this._dead) return;
    this.hp = Math.max(0, this.hp - amount);
    this._hitFlash = 150;
    this.setTint(0xff4444);
    if (this.hp <= 0) this._die();
  }

  _die() {
    this._dead = true;
    this.setTint(0x888888);
    this.setVelocity(0, 0);
    this.body.enable = false;
    // Drop loot
    this._dropLoot();
    this.scene.time.delayedCall(400, () => this.destroy());
  }

  _dropLoot() {
    const roll = Math.random();
    const lootKey = roll < 0.3 ? 'heart' : roll < 0.55 ? 'gold' : roll < 0.7 ? 'soul' : null;
    if (lootKey) {
      const loot = this.scene.physics.add.image(this.x, this.y - 8, lootKey);
      loot.setDepth(5);
      loot.setData('type', lootKey);
      loot.setVelocityY(-120);
      loot.setVelocityX(Phaser.Math.Between(-60, 60));
      loot.setBounce(0.3);
      this.scene.lootGroup.add(loot);
    }
  }

  updateHitFlash(dt) {
    if (this._hitFlash > 0) {
      this._hitFlash -= dt;
      if (this._hitFlash <= 0) this.clearTint();
    }
  }

  // Simple ground patrol logic
  patrolGround(dt, platforms) {
    this._patrolTimer -= dt;
    if (this._patrolTimer <= 0) {
      this._patrolDir *= -1;
      this._patrolTimer = Phaser.Math.Between(1500, 3000);
    }
    this.setVelocityX(this._patrolDir * this.speed);
    this.setFlipX(this._patrolDir < 0);
    if (this.body.blocked.left) this._patrolDir = 1;
    if (this.body.blocked.right) this._patrolDir = -1;
  }

  // Chase player if in range
  chasePlayer(player, range = 200) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < range && !player.isDead) {
      const dir = player.x > this.x ? 1 : -1;
      this.setVelocityX(dir * this.speed * 1.4);
      this.setFlipX(dir < 0);
      return true;
    }
    return false;
  }
}

// ──────────── Skeleton ────────────
export class Skeleton extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'skeleton', SKELETON_HP, SKELETON_SPEED, SKELETON_DAMAGE, SKELETON_SCORE);
    this.body.setSize(14, 30);
    this.body.setOffset(4, 2);
    this._attackCooldown = 0;
  }

  update(dt, player, platforms) {
    if (this._dead) return;
    this.updateHitFlash(dt);
    const chasing = this.chasePlayer(player, 220);
    if (!chasing) this.patrolGround(dt, platforms);
    // Throw bone projectile
    this._attackCooldown -= dt;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 200 && this._attackCooldown <= 0) {
      this._throwBone(player);
      this._attackCooldown = Phaser.Math.Between(2000, 3500);
    }
  }

  _throwBone(player) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const proj = this.scene.physics.add.image(this.x, this.y - 8, 'bone_fragment');
    proj.setDepth(7);
    proj.setData('damage', this.damage);
    proj.setData('source', this);
    this.scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), 180, proj.body.velocity);
    proj.setAngularVelocity(240);
    this.scene.enemyProjectiles.add(proj);
    this.scene.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
  }
}

// ──────────── Bat ────────────
export class Bat extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'bat', BAT_HP, BAT_SPEED, BAT_DAMAGE, BAT_SCORE);
    this.body.setAllowGravity(false);
    this.body.setSize(28, 12);
    this._sineOffset = Math.random() * Math.PI * 2;
    this._sineTime = this._sineOffset;
    this._startY = y;
  }

  update(dt, player, platforms) {
    if (this._dead) return;
    this.updateHitFlash(dt);
    this._sineTime += dt * 0.003;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist < 300 && !player.isDead) {
      // Dive toward player
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      this.setVelocityX((dx / len) * this.speed);
      this.setVelocityY((dy / len) * this.speed * 0.6 + Math.sin(this._sineTime) * 40);
    } else {
      // Idle sine wave
      this.setVelocityX(this._patrolDir * 40);
      this.setVelocityY(Math.sin(this._sineTime) * 50);
      this._patrolTimer -= dt;
      if (this._patrolTimer <= 0) {
        this._patrolDir *= -1;
        this._patrolTimer = Phaser.Math.Between(2000, 4000);
      }
    }
    this.setFlipX(this.body.velocity.x < 0);
  }
}

// ──────────── Ghost ────────────
export class Ghost extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'ghost', GHOST_HP, GHOST_SPEED, GHOST_DAMAGE, GHOST_SCORE);
    this.body.setAllowGravity(false);
    this.body.setSize(20, 26);
    this._phase = Math.random() * Math.PI * 2;
    this.setAlpha(0.85);
  }

  update(dt, player, platforms) {
    if (this._dead) return;
    this.updateHitFlash(dt);
    this._phase += dt * 0.002;

    if (!player.isDead) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      this.setVelocityX((dx / len) * this.speed + Math.sin(this._phase * 1.3) * 25);
      this.setVelocityY((dy / len) * this.speed * 0.8 + Math.cos(this._phase) * 20);
    }
    this.setFlipX(this.body.velocity.x < 0);
    // Pulse alpha
    this.setAlpha(0.6 + Math.sin(this._phase * 3) * 0.25);
  }
}

// ──────────── Medusa Head ────────────
export class MedusaHead extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'medusa', MEDUSA_HP, MEDUSA_SPEED, MEDUSA_DAMAGE, MEDUSA_SCORE);
    this.body.setAllowGravity(false);
    this.body.setSize(20, 24);
    this._dir = Math.random() > 0.5 ? 1 : -1;
    this._sineAmp = Phaser.Math.Between(40, 80);
    this._sineFreq = Phaser.Math.FloatBetween(0.002, 0.004);
    this._sineTime = Math.random() * Math.PI * 2;
    this._startY = y;
  }

  update(dt, player, platforms) {
    if (this._dead) return;
    this.updateHitFlash(dt);
    this._sineTime += dt * this._sineFreq * 1000;

    this.setVelocityX(this._dir * this.speed);
    this.y = this._startY + Math.sin(this._sineTime) * this._sineAmp;
    this.body.setVelocityY(0);
    this.setFlipX(this._dir < 0);

    // Turn around at world bounds
    if (this.x < 30) this._dir = 1;
    if (this.x > this.scene.levelWidth - 30) this._dir = -1;
  }
}
