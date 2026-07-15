import * as THREE from 'three';

// Builds a simple stylized low-poly humanoid entirely out of primitives
// (no external models/art), so every visual asset here is original.
export function buildHumanoid({ bodyColor = 0x3d7fd6, skinColor = 0xf1c27d, accent = 0xffd35c, scale = 1 } = {}) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.75 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5, metalness: 0.2 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.55, 4, 8), bodyMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  torso.name = 'torso';
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), skinMat);
  head.position.y = 1.62;
  head.castShadow = true;
  group.add(head);

  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 10), accentMat);
  hat.position.y = 1.94;
  hat.castShadow = true;
  group.add(hat);

  const armGeo = new THREE.CapsuleGeometry(0.09, 0.42, 3, 6);
  const armL = new THREE.Mesh(armGeo, skinMat);
  armL.position.set(-0.42, 1.1, 0);
  armL.rotation.z = 0.25;
  armL.castShadow = true;
  armL.name = 'armL';
  group.add(armL);

  const armR = new THREE.Mesh(armGeo, skinMat);
  armR.position.set(0.42, 1.1, 0);
  armR.rotation.z = -0.25;
  armR.castShadow = true;
  armR.name = 'armR';
  group.add(armR);

  const legGeo = new THREE.CapsuleGeometry(0.12, 0.5, 3, 6);
  const legL = new THREE.Mesh(legGeo, bodyMat);
  legL.position.set(-0.16, 0.35, 0);
  legL.castShadow = true;
  legL.name = 'legL';
  group.add(legL);

  const legR = new THREE.Mesh(legGeo, bodyMat);
  legR.position.set(0.16, 0.35, 0);
  legR.castShadow = true;
  legR.name = 'legR';
  group.add(legR);

  group.scale.setScalar(scale);
  group.userData.torso = torso;
  group.userData.legHeight = 0.35;
  return group;
}

export function buildRoyal({ dressColor = 0xffd35c } = {}) {
  const group = buildHumanoid({ bodyColor: dressColor, skinColor: 0xf6d3ae, accent: 0xffffff, scale: 1 });
  // Swap hat for a little crown
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xffe28a, metalness: 0.6, roughness: 0.3 });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.14, 8), crownMat);
  crown.position.y = 1.88;
  group.add(crown);
  return group;
}

// Weapon meshes, purely geometric/original.
export function buildWeapon(kind) {
  const g = new THREE.Group();
  if (kind === 'sword') {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.62, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xd9d9e0, metalness: 0.8, roughness: 0.25 })
    );
    blade.position.y = 0.4;
    const hilt = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x5a3d1f, roughness: 0.8 })
    );
    g.add(blade, hilt);
  } else if (kind === 'bow') {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.02, 6, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x7a4a25, roughness: 0.7 })
    );
    arc.rotation.z = Math.PI / 2;
    g.add(arc);
  } else if (kind === 'ladle') {
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x8a5a2a })
    );
    handle.position.y = 0.3;
    const cup = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xb0862c, metalness: 0.5, roughness: 0.4 })
    );
    cup.position.y = 0.55;
    g.add(handle, cup);
  }
  return g;
}

export const CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    desc: 'High health, strong melee swings. The frontline.',
    color: 0xff7a6b,
    hp: 140,
    speed: 4.6,
    attackDamage: 26,
    attackRange: 1.7,
    attackCooldown: 0.55,
    weapon: 'sword',
    ranged: false
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    desc: 'Fast and fragile. Fires arrows from a distance.',
    color: 0x5cd68a,
    hp: 90,
    speed: 5.6,
    attackDamage: 16,
    attackRange: 14,
    attackCooldown: 0.7,
    weapon: 'bow',
    ranged: true,
    projectileSpeed: 22
  },
  chef: {
    id: 'chef',
    name: 'Chef',
    desc: 'Throws cake to feed royals from range and heals allies.',
    color: 0xffc857,
    hp: 100,
    speed: 5.0,
    attackDamage: 12,
    attackRange: 1.6,
    attackCooldown: 0.6,
    weapon: 'ladle',
    ranged: false,
    feedBonus: 2.2
  }
};
