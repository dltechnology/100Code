import * as THREE from 'three';
import { buildRoyal } from './Characters.js';

const WALL_MAT = new THREE.MeshStandardMaterial({ color: 0x8a8a92, roughness: 0.9 });
const WALL_MAT_GOLD = new THREE.MeshStandardMaterial({ color: 0x9a8560, roughness: 0.9 });
const WALL_MAT_CRIMSON = new THREE.MeshStandardMaterial({ color: 0x8a6060, roughness: 0.9 });
const ROOF_MAT = new THREE.MeshStandardMaterial({ color: 0x4a3560, roughness: 0.7 });
const GROUND_MAT = new THREE.MeshStandardMaterial({ color: 0x4c7a3d, roughness: 1 });
const PATH_MAT = new THREE.MeshStandardMaterial({ color: 0xb8a374, roughness: 1 });
const WATER_MAT = new THREE.MeshStandardMaterial({ color: 0x2f7bb0, roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0.85 });
const GATE_MAT = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.85 });
const SPIKE_MAT = new THREE.MeshStandardMaterial({ color: 0xcfcfd6, metalness: 0.6, roughness: 0.3 });
const LOG_MAT = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.9 });

function tower(x, z, wallMat, radius = 2.2, height = 7) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.05, height, 10), wallMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(radius * 1.15, 2.4, 10), ROOF_MAT);
  roof.position.y = height + 1.1;
  roof.castShadow = true;
  g.add(body, roof);
  g.position.set(x, 0, z);
  return g;
}

function wallSegment(cx, cz, w, d, h, wallMat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  mesh.position.set(cx, h / 2, cz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export class Arena {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.time = 0;
    this.hazardGroup = new THREE.Group();
    this.scene.add(this.hazardGroup);
    this._buildGround();
    this._buildRiver();
    this.gold = this._buildCastle(-1, WALL_MAT_GOLD);
    this.crimson = this._buildCastle(1, WALL_MAT_CRIMSON);
    this._buildBridgesAndHazards();
    this._buildDecor();

    this.spawnPoints = {
      gold: [
        new THREE.Vector3(-4, 0, -34), new THREE.Vector3(4, 0, -34),
        new THREE.Vector3(-8, 0, -30), new THREE.Vector3(8, 0, -30)
      ],
      crimson: [
        new THREE.Vector3(-4, 0, 34), new THREE.Vector3(4, 0, 34),
        new THREE.Vector3(-8, 0, 30), new THREE.Vector3(8, 0, 30)
      ]
    };

    // Shared waypoints AI uses to path from own castle to the enemy castle,
    // routed through the two bridge chokepoints instead of straight lines.
    this.routes = {
      toEnemyViaLeftBridge: (fromTeam) => this._route(fromTeam, -18),
      toEnemyViaRightBridge: (fromTeam) => this._route(fromTeam, 18)
    };
  }

  _route(fromTeam, bridgeX) {
    const sign = fromTeam === 'gold' ? 1 : -1;
    const startZ = fromTeam === 'gold' ? -30 : 30;
    const endZ = fromTeam === 'gold' ? 30 : -30;
    return [
      new THREE.Vector3(bridgeX * 0.4, 0, startZ),
      new THREE.Vector3(bridgeX, 0, 0),
      new THREE.Vector3(bridgeX * 0.4, 0, endZ)
    ];
  }

  _buildGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), GROUND_MAT);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Central path strips leading to each bridge for visual guidance
    for (const x of [-18, 18]) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(6, 92), PATH_MAT);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(x, 0.01, 0);
      strip.receiveShadow = true;
      this.scene.add(strip);
    }
  }

  _buildRiver() {
    this.riverZ = [-4, 4];
    const water = new THREE.Mesh(new THREE.PlaneGeometry(92, 8), WATER_MAT);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.02, 0);
    this.scene.add(water);
    this.waterMesh = water;

    // Bridges (solid, faster crossing) at the two chokepoints
    for (const x of [-18, 18]) {
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 9), PATH_MAT);
      bridge.position.set(x, 0.15, 0);
      bridge.receiveShadow = true;
      bridge.castShadow = true;
      this.scene.add(bridge);
      const rail = (side) => {
        const r = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 0.15), new THREE.MeshStandardMaterial({ color: 0x5a3d1f }));
        r.position.set(x, 0.5, side * 4.4);
        this.scene.add(r);
      };
      rail(1); rail(-1);
    }
  }

  _buildCastle(sign, wallMat) {
    // sign: -1 = gold (negative Z), +1 = crimson (positive Z)
    const backZ = sign * 42;
    const gateZ = sign * 24;
    const courtyardCenterZ = sign * 36;

    const group = new THREE.Group();
    this.scene.add(group);

    // Corner towers
    const courtHalf = 13;
    const corners = [
      [-courtHalf, backZ - sign * courtHalf],
      [courtHalf, backZ - sign * courtHalf],
      [-courtHalf, backZ + sign * courtHalf],
      [courtHalf, backZ + sign * courtHalf]
    ];
    for (const [x, z] of corners) group.add(tower(x, z, wallMat));

    // Back + side walls (front is open except for the gate)
    group.add(wallSegment(0, backZ + sign * courtHalf, courtHalf * 2 + 2, 1.2, 6.5, wallMat));
    group.add(wallSegment(-courtHalf, courtyardCenterZ, 1.2, courtHalf * 2, 6.5, wallMat));
    group.add(wallSegment(courtHalf, courtyardCenterZ, 1.2, courtHalf * 2, 6.5, wallMat));

    this.world.addBox(0, backZ + sign * courtHalf, courtHalf + 1, 0.6, 0, 6.5);
    this.world.addBox(-courtHalf, courtyardCenterZ, 0.6, courtHalf, 0, 6.5);
    this.world.addBox(courtHalf, courtyardCenterZ, 0.6, courtHalf, 0, 6.5);

    // Gate: two flanking wall stubs + a destructible gate collider across the entrance
    group.add(wallSegment(-courtHalf + 3.5, gateZ, 6, 1.2, 6.5, wallMat));
    group.add(wallSegment(courtHalf - 3.5, gateZ, 6, 1.2, 6.5, wallMat));
    this.world.addBox(-courtHalf + 3.5, gateZ, 3, 0.6, 0, 6.5);
    this.world.addBox(courtHalf - 3.5, gateZ, 3, 0.6, 0, 6.5);

    const gateMesh = new THREE.Mesh(new THREE.BoxGeometry(7, 5.5, 1), GATE_MAT);
    gateMesh.position.set(0, 2.75, gateZ);
    gateMesh.castShadow = true;
    group.add(gateMesh);
    const gateColliderParams = [0, gateZ, 3.5, 0.6, 0, 6.5];
    const gateCollider = this.world.addBox(...gateColliderParams);

    // Cage + royal, at the back of the courtyard
    const cagePos = new THREE.Vector3(0, 0, backZ);
    const cageGroup = new THREE.Group();
    cageGroup.position.copy(cagePos);
    const cageMat = new THREE.MeshStandardMaterial({ color: 0x2b2b33, metalness: 0.6, roughness: 0.4 });
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
    floor.position.y = 0.08;
    cageGroup.add(floor);
    const barCount = 10;
    for (let i = 0; i < barCount; i++) {
      const a = (i / barCount) * Math.PI * 2;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), cageMat);
      bar.position.set(Math.cos(a) * 1.55, 1.3, Math.sin(a) * 1.55);
      cageGroup.add(bar);
    }
    const topRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.05, 6, 16), cageMat);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 2.6;
    cageGroup.add(topRing);

    const royal = buildRoyal({ dressColor: sign === -1 ? 0xffd35c : 0xff6b6b });
    cageGroup.add(royal);
    group.add(cageGroup);

    // Return circle: where an enemy carrier must bring the OPPOSING royal to win
    const returnZ = sign * 30;
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2, 24), new THREE.MeshStandardMaterial({ color: sign === -1 ? 0xffd35c : 0xff6b6b, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.03, returnZ);
    this.scene.add(ring);

    return {
      team: sign === -1 ? 'gold' : 'crimson',
      sign,
      group,
      cagePos,
      cageGroup,
      royalMesh: royal,
      returnPos: new THREE.Vector3(0, 0, returnZ),
      returnRadius: 2,
      gateZ,
      gateMesh,
      gateCollider,
      gateColliderParams,
      gateHp: 220,
      gateMaxHp: 220
    };
  }

  _buildBridgesAndHazards() {
    // Swinging log hazard at the left bridge
    const logGroup = new THREE.Group();
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 7.5, 8), LOG_MAT);
    log.rotation.z = Math.PI / 2;
    log.castShadow = true;
    const chainMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const CEILING_Y = 5;
    const LOG_Y = 1.0;
    const chainLen = CEILING_Y - LOG_Y;
    const chainL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, chainLen, 5), chainMat);
    chainL.position.set(-3.6, chainLen / 2, 0);
    const chainR = chainL.clone();
    chainR.position.x = 3.6;
    logGroup.add(log, chainL, chainR);
    logGroup.position.set(-18, LOG_Y, 0);
    this.hazardGroup.add(logGroup);
    this.swingLog = { group: logGroup, x: -18, y: LOG_Y, z: 0, halfHeight: 0.4, damage: 18, halfLen: 3.75 };

    // Wooden support gantry the log hangs from, purely decorative
    const postMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9 });
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, CEILING_Y, 8), postMat);
      post.position.set(-18, CEILING_Y / 2, side * 4.6);
      post.castShadow = true;
      this.scene.add(post);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 9.6), postMat);
    beam.position.set(-18, CEILING_Y, 0);
    beam.castShadow = true;
    this.scene.add(beam);

    // Spike trap at the right bridge
    const spikeGroup = new THREE.Group();
    for (let i = -2; i <= 2; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 6), SPIKE_MAT);
      spike.position.set(0, -0.3, i * 0.8);
      spikeGroup.add(spike);
    }
    spikeGroup.position.set(18, 0.3, 0);
    this.hazardGroup.add(spikeGroup);
    this.spikeTrap = { group: spikeGroup, x: 18, z: 0, halfW: 1.2, halfD: 3.6, damage: 10, up: false };
  }

  _buildDecor() {
    // Simple low-poly trees scattered off the main paths, purely decorative.
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d1f });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6b32 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 1 });
    const rng = mulberry32(1337);

    for (let i = 0; i < 26; i++) {
      const x = (rng() * 2 - 1) * 44;
      const z = (rng() * 2 - 1) * 44;
      if (Math.abs(x) < 8 && Math.abs(z) < 46) continue; // keep paths clear
      if (Math.abs(z) < 6) continue; // keep river clear
      if (Math.abs(z) > 22 && Math.abs(z) < 30 && Math.abs(x) < 16) continue; // keep gate approach clear

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.6, 6), trunkMat);
      trunk.position.y = 0.8;
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 7), leafMat);
      leaves.position.y = 2.3;
      leaves.castShadow = true;
      trunk.castShadow = true;
      tree.add(trunk, leaves);
      tree.position.set(x, 0, z);
      this.scene.add(tree);
    }

    // A few scattered rock obstacles in the open field for tactical cover
    const rockSpots = [[-10, -14], [10, -14], [-10, 14], [10, 14], [-24, -6], [24, 6]];
    for (const [x, z] of rockSpots) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), rockMat);
      rock.position.set(x, 0.5, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
      this.world.addBox(x, z, 1, 1, 0, 1.4);
    }
  }

  isInWater(x, z) {
    return z > this.riverZ[0] && z < this.riverZ[1] && Math.abs(x - (-18)) > 3.3 && Math.abs(x - 18) > 3.3;
  }

  breakGate(castle) {
    if (castle.gateCollider) {
      this.world.removeCollider(castle.gateCollider);
      castle.gateCollider = null;
    }
    castle.gateMesh.visible = false;
  }

  resetCastle(castle) {
    castle.gateHp = castle.gateMaxHp;
    castle.gateMesh.visible = true;
    if (!castle.gateCollider) {
      castle.gateCollider = this.world.addBox(...castle.gateColliderParams);
    }
    castle.royalMesh.rotation.set(0, 0, 0);
    castle.royalMesh.position.set(0, 0, 0);
    castle.cageGroup.add(castle.royalMesh);
  }

  update(dt) {
    this.time += dt;

    // Swinging log oscillates along X near the left bridge
    const log = this.swingLog;
    log.offset = Math.sin(this.time * 1.3) * 3.4;
    log.group.position.x = log.x + log.offset;
    log.group.rotation.y = Math.sin(this.time * 1.3) * 0.25;

    // Spike trap toggles up/down on a cycle
    const cyclePos = this.time % 3.2;
    this.spikeTrap.up = cyclePos > 1.6;
    this.spikeTrap.group.position.y = this.spikeTrap.up ? 0.32 : -0.35;

    // Subtle water shimmer
    this.waterMesh.material.opacity = 0.75 + Math.sin(this.time * 2) * 0.05;
  }
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
