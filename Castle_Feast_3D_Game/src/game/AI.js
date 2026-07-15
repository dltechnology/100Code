import * as THREE from 'three';
import { Entity } from './Entity.js';
import { distance2D } from '../core/Physics.js';

const AGGRO_RANGE = 13;
const CHASE_GIVE_UP_RANGE = 20;
const THREAT_INTERCEPT_RANGE = 46; // roughly the whole map: always chase a stolen royal

export class AI extends Entity {
  constructor(opts) {
    super(opts);
    this.role = opts.role; // 'attacker' | 'defender'
    this.arena = opts.arena;
    this.bridge = Math.random() < 0.5 ? 'left' : 'right';
    this.routeIndex = 0;
    this.patrolTarget = null;
    this.patrolTimer = 0;
    this.thinkTimer = Math.random() * 0.3;
    this.state = 'advance';
    this.wantsAttack = false;
    this.wantsInteract = false;
    this._moveTarget = null;
  }

  get enemyTeam() { return this.team === 'gold' ? 'crimson' : 'gold'; }

  _outRoute() {
    return this.bridge === 'left'
      ? this.arena.routes.toEnemyViaLeftBridge(this.team)
      : this.arena.routes.toEnemyViaRightBridge(this.team);
  }

  _homeRoute() {
    // Path from the enemy start zone back to mine uses the same bridge,
    // just queried from the enemy team's perspective.
    return this.bridge === 'left'
      ? this.arena.routes.toEnemyViaLeftBridge(this.enemyTeam)
      : this.arena.routes.toEnemyViaRightBridge(this.enemyTeam);
  }

  update(dt, game) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;
    this.wantsAttack = false;
    this.wantsInteract = false;

    if (!this.alive) {
      this.velocity.x = 0;
      this.velocity.z = 0;
      return;
    }

    this.thinkTimer -= dt;
    if (this.thinkTimer <= 0) {
      this.thinkTimer = 0.2 + Math.random() * 0.15;
      this._decide(game);
    }

    this._act(game, dt);
  }

  _decide(game) {
    const myRoyal = game.royals[this.team];
    const enemyRoyal = game.royals[this.enemyTeam];

    // Top priority: my own royal is being carried off by an enemy - hunt the carrier.
    if (myRoyal.status === 'carried' && myRoyal.carrierTeam === this.enemyTeam) {
      const carrier = game.entities.find((e) => e.id === myRoyal.carrierId);
      if (carrier && carrier.alive && distance2D(this.position, carrier.position) < THREAT_INTERCEPT_RANGE) {
        this.state = 'intercept';
        this.target = carrier;
        return;
      }
    }

    if (this.carrying) {
      if (this.state !== 'return') this.routeIndex = 0;
      this.state = 'return';
      this.target = null;
      return;
    }

    // Engage nearby enemies
    let nearest = null;
    let nearestDist = Infinity;
    for (const e of game.entities) {
      if (e.team !== this.enemyTeam || !e.alive) continue;
      const d = distance2D(this.position, e.position);
      if (d < AGGRO_RANGE && d < nearestDist) { nearest = e; nearestDist = d; }
    }
    if (nearest) {
      this.state = 'engage';
      this.target = nearest;
      return;
    }
    if (this.state === 'engage' && this.target && this.target.alive) {
      const d = distance2D(this.position, this.target.position);
      if (d < CHASE_GIVE_UP_RANGE) return; // keep chasing a bit past aggro range
    }

    if (this.role === 'attacker') {
      if (this.state !== 'advance') this.routeIndex = 0;
      this.state = 'advance';
      this.target = null;
    } else {
      this.state = 'defend';
      this.target = null;
      if (!this.patrolTarget || this.patrolTimer <= 0) {
        const home = game.arena[this.team].cagePos;
        const a = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 6;
        this.patrolTarget = new THREE.Vector3(home.x + Math.cos(a) * r, 0, home.z + Math.sin(a) * r);
        this.patrolTimer = 3 + Math.random() * 3;
      }
    }
  }

  _act(game, dt) {
    this.patrolTimer -= dt;
    const castle = game.arena[this.team];
    const enemyCastle = game.arena[this.enemyTeam];
    const myRoyal = game.royals[this.team];
    const enemyRoyal = game.royals[this.enemyTeam];

    let moveTo = null;
    let allowAttack = false;

    if (this.state === 'intercept' && this.target && this.target.alive) {
      moveTo = this.target.position;
      allowAttack = distance2D(this.position, this.target.position) <= this.classConfig.attackRange + 0.3;
    } else if (this.state === 'engage' && this.target && this.target.alive) {
      moveTo = this.target.position;
      allowAttack = distance2D(this.position, this.target.position) <= this.classConfig.attackRange + 0.3;
    } else if (this.state === 'return') {
      const route = this._homeRoute();
      const wp = this._followRoute(route, castle.returnPos);
      moveTo = wp;
      if (distance2D(this.position, castle.returnPos) < castle.returnRadius) {
        game.completeCarry(this);
      }
    } else if (this.state === 'advance') {
      if (!enemyCastle.gateCollider) {
        // Gate is down: push toward the royal / cage
        if (enemyRoyal.status === 'free') {
          moveTo = enemyCastle.cagePos;
          if (distance2D(this.position, enemyCastle.cagePos) < 1.6) this.wantsInteract = true;
        } else if (enemyRoyal.status === 'dropped') {
          moveTo = enemyRoyal.dropPos;
          if (distance2D(this.position, enemyRoyal.dropPos) < 1.4) this.wantsInteract = true;
        } else if (enemyRoyal.status === 'caged') {
          moveTo = enemyCastle.cagePos;
          const d = distance2D(this.position, enemyCastle.cagePos);
          allowAttack = d < 3.2;
          if (d > 3.2) moveTo = enemyCastle.cagePos;
        } else {
          moveTo = enemyCastle.cagePos;
        }
      } else {
        const route = this._outRoute();
        const wp = this._followRoute(route, new THREE.Vector3(0, 0, enemyCastle.gateZ - enemyCastle.sign * 4));
        moveTo = wp;
        const dGate = distance2D(this.position, new THREE.Vector3(0, 0, enemyCastle.gateZ));
        if (dGate < 4.5) { moveTo = new THREE.Vector3(0, 0, enemyCastle.gateZ); allowAttack = true; }
      }
    } else if (this.state === 'defend') {
      moveTo = this.patrolTarget;
      if (myRoyal.weight < 60 && distance2D(this.position, castle.cagePos) < 3 && !game.hasNearbyEnemy(this, 8)) {
        this.wantsInteract = true;
        moveTo = castle.cagePos;
      }
    }

    if (moveTo) {
      const dx = moveTo.x - this.position.x;
      const dz = moveTo.z - this.position.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.15) {
        const speed = allowAttack ? this.speed * 0.15 : this.speed;
        this.velocity.x = (dx / d) * speed;
        this.velocity.z = (dz / d) * speed;
        this.facing = Math.atan2(dx, dz);
      } else {
        this.velocity.x = 0;
        this.velocity.z = 0;
      }
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    if (allowAttack && !this.carrying && this.attackCooldownTimer <= 0) this.wantsAttack = true;
  }

  _followRoute(route, finalTarget) {
    if (this.routeIndex >= route.length) return finalTarget;
    const wp = route[this.routeIndex];
    if (distance2D(this.position, wp) < 2.2) this.routeIndex++;
    return wp;
  }
}
