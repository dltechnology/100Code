import { PLAYER_SPEED, PLAYER_JUMP, PLAYER_HP, PLAYER_ATTACK, PLAYER_IFRAME_MS, COLORS } from '../utils/Constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(14, 32);
    this.body.setOffset(5, 2);
    this.setDepth(10);

    this.hp = PLAYER_HP;
    this.maxHp = PLAYER_HP;
    this.score = 0;
    this.souls = 0;
    this.attack = PLAYER_ATTACK;

    this._facing = 1; // 1 = right, -1 = left
    this._attacking = false;
    this._attackTimer = 0;
    this._iframes = 0;
    this._jumpCount = 0;
    this._dead = false;
    this._attackCooldown = 0;
    this._knockback = 0;

    this._slashGfx = scene.add.image(x, y, 'sword_slash').setDepth(11).setVisible(false);
    this._flashTimer = 0;
  }

  get facing() { return this._facing; }
  get isAttacking() { return this._attacking; }
  get isDead() { return this._dead; }

  // attackJustDown and jumpJustDown are plain booleans (pre-computed by scene)
  update(dt, cursors, attackJustDown, jumpJustDown) {
    if (this._dead) return;

    const onGround = this.body.blocked.down;
    if (onGround) this._jumpCount = 0;

    // Iframe flash
    if (this._iframes > 0) {
      this._iframes -= dt;
      this._flashTimer += dt;
      this.setAlpha(Math.floor(this._flashTimer / 80) % 2 === 0 ? 0.4 : 1);
    } else {
      this.setAlpha(1);
      this._flashTimer = 0;
    }

    if (this._attackCooldown > 0) this._attackCooldown -= dt;

    // Knockback fades
    if (this._knockback > 0) {
      this._knockback -= dt * 4;
      if (this._knockback < 0) this._knockback = 0;
      return; // no movement during knockback
    }

    // Movement
    const left = cursors.left.isDown;
    const right = cursors.right.isDown;

    if (left) {
      this.setVelocityX(-PLAYER_SPEED);
      this._facing = -1;
      this.setFlipX(true);
    } else if (right) {
      this.setVelocityX(PLAYER_SPEED);
      this._facing = 1;
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // Jump (double jump)
    if (jumpJustDown && this._jumpCount < 2) {
      this.setVelocityY(PLAYER_JUMP + (this._jumpCount === 1 ? 60 : 0));
      this._jumpCount++;
    }

    // Attack
    if (attackJustDown && this._attackCooldown <= 0) {
      this._triggerAttack();
    }

    // Attack animation progress
    if (this._attacking) {
      this._attackTimer -= dt;
      this._positionSlash();
      if (this._attackTimer <= 0) {
        this._attacking = false;
        this._slashGfx.setVisible(false);
        this._attackCooldown = 180;
      }
    }

    // Gravity feel tweak – fast fall
    if (this.body.velocity.y > 0 && !onGround) {
      this.body.setGravityY(200);
    } else {
      this.body.setGravityY(0);
    }
  }

  _triggerAttack() {
    this._attacking = true;
    this._attackTimer = 220;
    this._slashGfx.setVisible(true);
    this._positionSlash();
  }

  _positionSlash() {
    const ox = this._facing * 26;
    this._slashGfx.setPosition(this.x + ox, this.y - 4);
    this._slashGfx.setFlipX(this._facing < 0);
  }

  getAttackBounds() {
    if (!this._attacking) return null;
    const ox = this._facing * 26;
    return new Phaser.Geom.Rectangle(
      this.x + ox - 22,
      this.y - 16,
      44, 28
    );
  }

  takeDamage(amount, sourceX) {
    if (this._iframes > 0 || this._dead) return;
    this.hp = Math.max(0, this.hp - amount);
    this._iframes = PLAYER_IFRAME_MS;
    // Knockback away from source
    const dir = this.x >= sourceX ? 1 : -1;
    this.setVelocityX(dir * 220);
    this.setVelocityY(-180);
    this._knockback = 300;
    if (this.hp <= 0) this._die();
    this.scene.events.emit('playerDamaged', this.hp, this.maxHp);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.scene.events.emit('playerDamaged', this.hp, this.maxHp);
  }

  collectSoul() {
    this.souls++;
    this.scene.events.emit('soulCollected', this.souls);
  }

  addScore(points) {
    this.score += points;
    this.scene.events.emit('scoreChanged', this.score);
  }

  _die() {
    this._dead = true;
    this._slashGfx.setVisible(false);
    this.setTint(0x440000);
    this.scene.time.delayedCall(1200, () => {
      this.scene.events.emit('playerDied');
    });
  }

  destroy() {
    this._slashGfx.destroy();
    super.destroy();
  }
}
