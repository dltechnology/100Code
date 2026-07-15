import * as THREE from 'three';
import { World, stepEntityPhysics, distance2D, ARENA_HALF } from '../core/Physics.js';
import { InputController } from '../core/InputController.js';
import { Arena } from './Arena.js';
import { Player } from './Player.js';
import { AI } from './AI.js';
import { CLASSES } from './Characters.js';
import { createRoyalState, applyWeightVisual, carryWeightMultiplier, MAX_WEIGHT, FEED_RATE } from './Princess.js';
import * as HUD from '../ui/HUD.js';

const BOT_CLASS_IDS = Object.keys(CLASSES);
const MATCH_SECONDS = 300;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.selectedClass = 'warrior';
    this.matchActive = false;

    this._setupRenderer();
    this._setupScene();

    this.world = new World();
    this.arena = new Arena(this.scene, this.world);

    this.input = new InputController();
    this.clock = new THREE.Clock();

    this.entities = [];
    this.aiEntities = [];
    this.projectiles = [];
    this.player = null;
    this.royals = { gold: createRoyalState(), crimson: createRoyalState() };

    this.cameraYaw = 0;
    this.cameraPitch = 0.55;
    this.cameraDist = 7.5;

    window.addEventListener('resize', () => this._onResize());
    this._onResize();
  }

  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8fc7e8);
    this.scene.fog = new THREE.Fog(0x8fc7e8, 40, 95);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 200);

    const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x3a4a2a, 0.9);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff3d6, 1.15);
    sun.position.set(-20, 30, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.camera.far = 80;
    this.scene.add(sun);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- match

  startMatch(classId) {
    this.selectedClass = classId || this.selectedClass;
    this._teardownEntities();
    this.royals.gold = createRoyalState();
    this.royals.crimson = createRoyalState();
    this.arena.resetCastle(this.arena.gold);
    this.arena.resetCastle(this.arena.crimson);
    applyWeightVisual(this.arena.gold.royalMesh, this.royals.gold.weight);
    applyWeightVisual(this.arena.crimson.royalMesh, this.royals.crimson.weight);

    this._spawnTeams();

    this.timeLeft = MATCH_SECONDS;
    this.matchActive = true;
    this.clock.start();
    this._loop();
  }

  _teardownEntities() {
    for (const e of this.entities) {
      this.scene.remove(e.mesh);
    }
    for (const p of this.projectiles) {
      this.scene.remove(p.mesh);
    }
    this.entities = [];
    this.aiEntities = [];
    this.projectiles = [];
    this.player = null;
  }

  _spawnTeams() {
    const goldSpawn = this.arena.spawnPoints.gold[0];
    this.player = new Player({ team: 'gold', classConfig: CLASSES[this.selectedClass], position: goldSpawn });
    this.entities.push(this.player);
    this.scene.add(this.player.mesh);

    this._spawnBots('gold', [
      { role: 'attacker' }, { role: 'attacker' }, { role: 'defender' }, { role: 'defender' }
    ]);
    this._spawnBots('crimson', [
      { role: 'attacker' }, { role: 'attacker' }, { role: 'attacker' }, { role: 'defender' }, { role: 'defender' }
    ]);
  }

  _spawnBots(team, roster) {
    const spawns = this.arena.spawnPoints[team];
    roster.forEach((slot, i) => {
      const classId = BOT_CLASS_IDS[Math.floor(Math.random() * BOT_CLASS_IDS.length)];
      const pos = spawns[i % spawns.length];
      const bot = new AI({ team, classConfig: CLASSES[classId], position: pos, role: slot.role, arena: this.arena });
      this.entities.push(bot);
      this.aiEntities.push(bot);
      this.scene.add(bot.mesh);
    });
  }

  spawnPointFor(entity) {
    const pts = this.arena.spawnPoints[entity.team];
    return pts[Math.floor(Math.random() * pts.length)];
  }

  hasNearbyEnemy(entity, radius) {
    const enemyTeam = entity.team === 'gold' ? 'crimson' : 'gold';
    for (const e of this.entities) {
      if (e.team === enemyTeam && e.alive && distance2D(entity.position, e.position) < radius) return true;
    }
    return false;
  }

  // -------------------------------------------------------------- combat

  findAttackTarget(entity) {
    const range = entity.classConfig.attackRange;
    let best = null, bestDist = Infinity, bestType = null;

    for (const e of this.entities) {
      if (e === entity || e.team === entity.team || !e.alive) continue;
      const d = distance2D(entity.position, e.position);
      if (d <= range && d < bestDist) { best = e; bestDist = d; bestType = 'entity'; }
    }

    const enemyTeam = entity.team === 'gold' ? 'crimson' : 'gold';
    const enemyCastle = this.arena[enemyTeam];
    const enemyRoyal = this.royals[enemyTeam];

    if (enemyCastle.gateHp > 0) {
      const d = distance2D(entity.position, new THREE.Vector3(0, 0, enemyCastle.gateZ));
      if (d <= range + 1 && d < bestDist) { best = enemyCastle; bestDist = d; bestType = 'gate'; }
    }
    if (enemyRoyal.status === 'caged' && enemyRoyal.lockHp > 0) {
      const d = distance2D(entity.position, enemyCastle.cagePos);
      if (d <= range + 0.6 && d < bestDist) { best = enemyCastle; bestDist = d; bestType = 'lock'; }
    }

    return best ? { type: bestType, ref: best, dist: bestDist } : null;
  }

  applyDamage(target, type, dmg, attacker) {
    if (type === 'entity') {
      target.takeDamage(dmg, attacker.position);
      if (!target.alive) this.onDeath(target);
    } else if (type === 'gate') {
      target.gateHp = Math.max(0, target.gateHp - dmg);
      if (target.gateHp <= 0) this.arena.breakGate(target);
    } else if (type === 'lock') {
      const royal = this.royals[target.team];
      royal.lockHp = Math.max(0, royal.lockHp - dmg);
      if (royal.lockHp <= 0) royal.status = 'free';
    }
  }

  onDeath(entity) {
    if (entity.carrying) this.dropCarriedRoyal(entity);
  }

  fireProjectile(entity) {
    const enemyTeam = entity.team === 'gold' ? 'crimson' : 'gold';
    let dir = new THREE.Vector3(Math.sin(entity.facing), 0, Math.cos(entity.facing));
    let nearest = null, nearestDist = Infinity;
    for (const e of this.entities) {
      if (e.team !== enemyTeam || !e.alive) continue;
      const d = distance2D(entity.position, e.position);
      if (d <= entity.classConfig.attackRange && d < nearestDist) { nearest = e; nearestDist = d; }
    }
    if (nearest) {
      const toTarget = new THREE.Vector3(nearest.position.x - entity.position.x, 0, nearest.position.z - entity.position.z);
      if (toTarget.lengthSq() > 0.0001) dir = toTarget.normalize();
    }

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshStandardMaterial({ color: entity.team === 'gold' ? 0xffd35c : 0xff6b6b, emissive: 0x442200 })
    );
    mesh.position.set(entity.position.x, entity.position.y + 1.1, entity.position.z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.projectiles.push({
      position: mesh.position,
      velocity: dir.multiplyScalar(entity.classConfig.projectileSpeed),
      damage: entity.classConfig.attackDamage,
      team: entity.team,
      radius: 0.15,
      life: 2.2,
      mesh
    });
  }

  updateProjectiles(dt) {
    const enemyOf = (team) => (team === 'gold' ? 'crimson' : 'gold');
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.position.addScaledVector(p.velocity, dt);
      p.life -= dt;
      let hit = false;

      if (Math.abs(p.position.x) > ARENA_HALF + 2 || Math.abs(p.position.z) > ARENA_HALF + 2) hit = true;

      if (!hit) {
        for (const e of this.entities) {
          if (e.team !== enemyOf(p.team) || !e.alive) continue;
          const d = distance2D(p.position, e.position);
          if (d < e.radius + p.radius && p.position.y < e.height + 0.4 && p.position.y > -0.2) {
            e.takeDamage(p.damage, p.position);
            if (!e.alive) this.onDeath(e);
            hit = true;
            break;
          }
        }
      }

      if (!hit) {
        const enemyCastle = this.arena[enemyOf(p.team)];
        if (enemyCastle.gateHp > 0) {
          const d = distance2D(p.position, new THREE.Vector3(0, 0, enemyCastle.gateZ));
          if (d < 1.8) { this.applyDamage(enemyCastle, 'gate', p.damage, { position: p.position }); hit = true; }
        }
        if (!hit) {
          const enemyRoyal = this.royals[enemyCastle.team];
          if (enemyRoyal.status === 'caged' && enemyRoyal.lockHp > 0) {
            const d = distance2D(p.position, enemyCastle.cagePos);
            if (d < 2) { this.applyDamage(enemyCastle, 'lock', p.damage, { position: p.position }); hit = true; }
          }
        }
      }

      if (hit || p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  applyHazards(dt) {
    const log = this.arena.swingLog;
    const spike = this.arena.spikeTrap;
    const logX = log.group.position.x;

    for (const e of this.entities) {
      if (!e.alive) continue;
      if (e.hazardCooldown === undefined) e.hazardCooldown = 0;
      if (e.hazardCooldown > 0) { e.hazardCooldown -= dt; continue; }

      const inLogSpan = Math.abs(e.position.x - logX) < log.halfLen + e.radius &&
        Math.abs(e.position.z - log.z) < 0.6 + e.radius;
      const inLogBand = e.position.y < log.y + log.halfHeight && (e.position.y + e.height) > (log.y - log.halfHeight);
      if (inLogSpan && inLogBand) {
        e.takeDamage(log.damage, new THREE.Vector3(logX, log.y, log.z));
        e.velocity.x += (e.position.x < logX ? -1 : 1) * 6;
        e.velocity.y = 4;
        e.hazardCooldown = 1.2;
        if (!e.alive) this.onDeath(e);
        continue;
      }

      if (spike.up &&
        Math.abs(e.position.x - spike.x) < spike.halfW + e.radius &&
        Math.abs(e.position.z - spike.z) < spike.halfD + e.radius &&
        e.position.y < 0.5) {
        e.takeDamage(spike.damage, null);
        e.hazardCooldown = 0.6;
        if (!e.alive) this.onDeath(e);
      }
    }
  }

  // -------------------------------------------------------------- royal state

  resolveInteract(entity, dt) {
    if (!entity.alive) return;
    const ownCastle = this.arena[entity.team];
    const ownRoyal = this.royals[entity.team];
    const enemyTeam = entity.team === 'gold' ? 'crimson' : 'gold';
    const enemyCastle = this.arena[enemyTeam];
    const enemyRoyal = this.royals[enemyTeam];

    if (ownRoyal.status === 'caged' && distance2D(entity.position, ownCastle.cagePos) < 2.4) {
      const bonus = entity.classConfig.feedBonus || 1;
      ownRoyal.weight = Math.min(MAX_WEIGHT, ownRoyal.weight + FEED_RATE * bonus * dt);
      applyWeightVisual(ownCastle.royalMesh, ownRoyal.weight);
      return;
    }

    if (enemyRoyal.status === 'free' && !entity.carrying && distance2D(entity.position, enemyCastle.cagePos) < 2.2) {
      this.pickupFreeRoyal(entity, enemyTeam);
      return;
    }

    for (const team of ['gold', 'crimson']) {
      const royal = this.royals[team];
      if (royal.status === 'dropped' && royal.dropPos && !entity.carrying && distance2D(entity.position, royal.dropPos) < 1.8) {
        if (entity.team === team) this.rescueRoyal(team);
        else this.resumeCarryFromDrop(entity, team);
        return;
      }
    }
  }

  pickupFreeRoyal(entity, ownerTeam) {
    const royal = this.royals[ownerTeam];
    const castle = this.arena[ownerTeam];
    royal.status = 'carried';
    royal.carrierId = entity.id;
    royal.carrierTeam = entity.team;
    entity.carrying = ownerTeam;
    entity.carryWeightMultiplier = carryWeightMultiplier(royal.weight);
    this.scene.add(castle.royalMesh);
  }

  dropCarriedRoyal(entity) {
    const ownerTeam = entity.carrying;
    const royal = this.royals[ownerTeam];
    const castle = this.arena[ownerTeam];
    royal.status = 'dropped';
    royal.dropPos = entity.position.clone();
    royal.carrierId = null;
    royal.carrierTeam = null;
    entity.carrying = null;
    castle.royalMesh.position.set(royal.dropPos.x, 0.05, royal.dropPos.z);
    castle.royalMesh.rotation.z = Math.PI / 2;
  }

  rescueRoyal(ownerTeam) {
    const royal = this.royals[ownerTeam];
    const castle = this.arena[ownerTeam];
    royal.status = 'caged';
    royal.lockHp = royal.lockMaxHp * 0.5;
    royal.dropPos = null;
    castle.royalMesh.rotation.set(0, 0, 0);
    castle.royalMesh.position.set(0, 0, 0);
    castle.cageGroup.add(castle.royalMesh);
  }

  resumeCarryFromDrop(entity, ownerTeam) {
    const royal = this.royals[ownerTeam];
    const castle = this.arena[ownerTeam];
    royal.status = 'carried';
    royal.carrierId = entity.id;
    royal.carrierTeam = entity.team;
    royal.dropPos = null;
    entity.carrying = ownerTeam;
    entity.carryWeightMultiplier = carryWeightMultiplier(royal.weight);
    castle.royalMesh.rotation.set(0, 0, 0);
  }

  completeCarry(entity) {
    if (!entity.carrying) return;
    const royal = this.royals[entity.carrying];
    if (royal.status !== 'carried' || royal.carrierId !== entity.id) return;
    this.endMatch(entity.team);
  }

  // -------------------------------------------------------------- loop

  _loop() {
    if (!this.matchActive) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this._update(dt);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this._loop());
  }

  _update(dt) {
    this.input.update();
    this.arena.update(dt);

    this.player.update(dt, { input: this.input, cameraYaw: this.cameraYaw });
    for (const ai of this.aiEntities) ai.update(dt, this);

    for (const e of this.entities) {
      if (e.alive) stepEntityPhysics(e, dt, this.world);
      else e.velocity.set(0, 0, 0);
    }

    for (const e of this.entities) {
      if (!e.alive) continue;
      if (e.wantsAttack) {
        e.attackCooldownTimer = e.classConfig.attackCooldown;
        if (e.classConfig.ranged) this.fireProjectile(e);
        else {
          const target = this.findAttackTarget(e);
          if (target) this.applyDamage(target.ref, target.type, e.classConfig.attackDamage, e);
        }
      }
      if (e.wantsInteract) this.resolveInteract(e, dt);
    }

    this.updateProjectiles(dt);
    this.applyHazards(dt);

    if (this.player.alive && this.player.carrying) {
      const castle = this.arena[this.player.team];
      if (distance2D(this.player.position, castle.returnPos) < castle.returnRadius) this.completeCarry(this.player);
    }

    for (const e of this.entities) {
      if (e.carrying) {
        const castle = this.arena[e.carrying];
        const fwd = Math.sin(e.facing);
        const fwdZ = Math.cos(e.facing);
        castle.royalMesh.position.set(e.position.x - fwd * 0.25, e.position.y + 1.0, e.position.z - fwdZ * 0.25);
        castle.royalMesh.rotation.y = e.facing;
      }
    }

    for (const e of this.entities) {
      if (!e.alive) {
        e.respawnTimer -= dt;
        if (e.respawnTimer <= 0) e.respawnAt(this.spawnPointFor(e));
      }
    }

    for (const e of this.entities) e.syncMesh();

    this._updateCamera(dt);

    if (this.matchActive) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.endMatch('draw'); }
    }

    this._updateHUD();
  }

  _updateCamera(dt) {
    const targetYaw = this.player.facing;
    let diff = targetYaw - this.cameraYaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.cameraYaw += diff * Math.min(1, dt * 4);

    const back = new THREE.Vector3(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw)).multiplyScalar(-this.cameraDist);
    const desired = new THREE.Vector3(
      this.player.position.x + back.x,
      this.player.position.y + this.cameraDist * this.cameraPitch + 1.2,
      this.player.position.z + back.z
    );
    this.camera.position.lerp(desired, Math.min(1, dt * 6));
    this.camera.lookAt(this.player.position.x, this.player.position.y + 1.3, this.player.position.z);
  }

  _objectiveText() {
    if (this.player.carrying) return 'Carrying their Royal — run for your return circle!';
    const own = this.royals[this.player.team];
    if (own.status === 'carried') return 'Your Royal has been kidnapped — stop the carrier!';
    if (own.status === 'dropped') return 'Your Royal was dropped nearby — go rescue her!';
    if (own.status === 'free') return 'Your cage is broken — defend your Royal!';
    const enemyTeam = this.player.team === 'gold' ? 'crimson' : 'gold';
    const enemyCastle = this.arena[enemyTeam];
    if (enemyCastle.gateHp <= 0) return "Enemy gate is down — break their Royal's cage!";
    return 'Feed your Royal, then storm the enemy gate.';
  }

  _updateHUD() {
    HUD.updateHUD({
      timeLeft: this.timeLeft,
      royals: this.royals,
      playerHp: this.player.hp,
      playerMaxHp: this.player.maxHp,
      carrying: !!this.player.carrying,
      objective: this._objectiveText()
    });
  }

  endMatch(winner) {
    this.matchActive = false;
    HUD.showEndScreen({ winner, playerTeam: this.player.team });
  }
}
