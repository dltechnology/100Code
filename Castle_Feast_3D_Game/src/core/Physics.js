// Minimal custom physics: gravity + ground plane + cylinder-vs-AABB collision.
// Deliberately lightweight (no external physics engine) to keep the bundle
// small and frame times predictable on phones.

export const GRAVITY = -22;
export const ARENA_HALF = 46; // world bounds, keeps entities inside the level

export class World {
  constructor() {
    this.colliders = []; // static AABB boxes: {minX,maxX,minY,maxY,minZ,maxZ, solid}
  }

  addBox(cx, cz, halfW, halfD, minY, maxY) {
    this.colliders.push({
      minX: cx - halfW, maxX: cx + halfW,
      minZ: cz - halfD, maxZ: cz + halfD,
      minY, maxY
    });
    return this.colliders[this.colliders.length - 1];
  }

  removeCollider(box) {
    const i = this.colliders.indexOf(box);
    if (i >= 0) this.colliders.splice(i, 1);
  }
}

// Resolve a vertical-cylinder entity (radius r, feet at position.y) against
// the world. Mutates entity.position/velocity/grounded in place.
export function stepEntityPhysics(entity, dt, world) {
  const p = entity.position;
  const v = entity.velocity;

  v.y += GRAVITY * dt;

  p.x += v.x * dt;
  p.y += v.y * dt;
  p.z += v.z * dt;

  // Ground plane
  entity.grounded = false;
  if (p.y <= 0) {
    p.y = 0;
    v.y = 0;
    entity.grounded = true;
  }

  // Arena bounds
  p.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, p.x));
  p.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, p.z));

  // Static collider push-out (cylinder vs AABB, XZ only, gated by Y overlap)
  const r = entity.radius || 0.5;
  const feetY = p.y;
  const headY = p.y + (entity.height || 1.8);

  for (const box of world.colliders) {
    if (headY < box.minY || feetY > box.maxY) continue;

    const closestX = Math.max(box.minX, Math.min(p.x, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(p.z, box.maxZ));
    const dx = p.x - closestX;
    const dz = p.z - closestZ;
    const distSq = dx * dx + dz * dz;

    if (distSq < r * r) {
      const dist = Math.sqrt(distSq) || 0.0001;
      const push = (r - dist) + 0.001;
      p.x += (dx / dist) * push;
      p.z += (dz / dist) * push;
    }
  }
}

export function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
