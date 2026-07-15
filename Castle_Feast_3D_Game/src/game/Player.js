import { Entity } from './Entity.js';

export class Player extends Entity {
  constructor(opts) {
    super({ ...opts, isPlayer: true });
    this.jumpForce = 8.2;
    this.wantsAttack = false;
    this.wantsInteract = false;
  }

  update(dt, { input, cameraYaw }) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;

    if (!this.alive) {
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.wantsAttack = false;
      this.wantsInteract = false;
      return;
    }

    const mx = input.move.x;
    const my = -input.move.y; // stick up = forward
    const len = Math.hypot(mx, my);

    if (len > 0.08) {
      const clampedLen = Math.min(len, 1);
      const nx = (mx / len) * clampedLen;
      const ny = (my / len) * clampedLen;
      const sin = Math.sin(cameraYaw);
      const cos = Math.cos(cameraYaw);
      const worldX = nx * cos + ny * sin;
      const worldZ = -nx * sin + ny * cos;
      this.velocity.x = worldX * this.speed;
      this.velocity.z = worldZ * this.speed;
      this.facing = Math.atan2(worldX, worldZ);
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    if (input.consumeJustPressed('jump') && this.grounded && !this.carrying) {
      this.velocity.y = this.jumpForce;
    }

    this.wantsAttack = input.buttons.attack && !this.carrying && this.attackCooldownTimer <= 0;
    this.wantsInteract = input.buttons.interact;
  }
}
