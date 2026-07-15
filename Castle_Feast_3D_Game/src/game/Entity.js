import * as THREE from 'three';
import { buildHumanoid, buildWeapon } from './Characters.js';

let nextId = 1;

export class Entity {
  constructor({ team, classConfig, position, isPlayer = false }) {
    this.id = nextId++;
    this.team = team; // 'gold' | 'crimson'
    this.classConfig = classConfig;
    this.isPlayer = isPlayer;

    this.position = position.clone();
    this.velocity = new THREE.Vector3();
    this.radius = 0.42;
    this.height = 1.8;

    this.maxHp = classConfig.hp;
    this.hp = classConfig.hp;
    this.alive = true;
    this.grounded = true;
    this.facing = team === 'gold' ? 0 : Math.PI;

    this.attackCooldownTimer = 0;
    this.carrying = null; // 'gold' | 'crimson' castle id whose royal this entity carries
    this.hitFlashTimer = 0;
    this.respawnTimer = 0;
    this.feedHoldTimer = 0;
    this.pickupHoldTimer = 0;

    this.mesh = buildHumanoid({
      bodyColor: classConfig.color,
      scale: 1
    });
    const weapon = buildWeapon(classConfig.weapon);
    weapon.position.set(0.06, -0.32, 0.05);
    this.mesh.userData.armR = this.mesh.getObjectByName('armR');
    this.mesh.userData.armR.add(weapon);
    this.weaponMesh = weapon;

    this._baseMaterials = [];
    this.mesh.traverse((o) => {
      if (o.isMesh) this._baseMaterials.push({ mesh: o, color: o.material.color.clone() });
    });
  }

  get speed() {
    let s = this.classConfig.speed;
    if (this.carrying) s *= this.carryWeightMultiplier ?? 0.55;
    return s;
  }

  syncMesh() {
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.rotation.y = this.facing;

    if (this.hitFlashTimer > 0) {
      for (const { mesh } of this._baseMaterials) mesh.material.color.setHex(0xffffff);
    } else if (!this.alive) {
      for (const { mesh } of this._baseMaterials) mesh.material.color.setHex(0x555555);
    } else {
      for (const { mesh, color } of this._baseMaterials) mesh.material.color.copy(color);
    }

    // simple walk bob using legs
    const legL = this.mesh.getObjectByName('legL');
    const legR = this.mesh.getObjectByName('legR');
    const moving = this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z > 0.05;
    const t = performance.now() / 1000;
    if (legL && legR) {
      const swing = moving ? Math.sin(t * 9) * 0.5 : 0;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
    }
  }

  takeDamage(amount, sourcePos) {
    if (!this.alive) return;
    this.hp -= amount;
    this.hitFlashTimer = 0.15;
    if (sourcePos) {
      const kb = new THREE.Vector3(this.position.x - sourcePos.x, 0, this.position.z - sourcePos.z);
      if (kb.lengthSq() > 0.0001) {
        kb.normalize().multiplyScalar(3.2);
        this.velocity.x += kb.x;
        this.velocity.z += kb.z;
      }
    }
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.respawnTimer = 5;
  }

  respawnAt(position) {
    this.hp = this.maxHp;
    this.alive = true;
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
  }
}
