// Royal capture-objective state machine + the visual "fattening" effect.
// status: 'caged' -> 'free' (lock broken, waiting to be picked up) ->
//         'carried' (someone is walking her home) -> 'dropped' (carrier was
//         knocked out) -> back to 'carried' or rescued to 'caged'.

export const MAX_WEIGHT = 100;
export const FEED_RATE = 16; // weight per second while actively fed
export const WEIGHT_DECAY = 0; // royals don't slim down on their own

export function createRoyalState() {
  return {
    status: 'caged',
    weight: 15,
    lockHp: 90,
    lockMaxHp: 90,
    carrierId: null,
    carrierTeam: null,
    dropPos: null
  };
}

// Heavier royal = much slower carrier. Returns a multiplier applied to the
// carrying entity's base movement speed.
export function carryWeightMultiplier(weight) {
  const t = Math.min(1, weight / MAX_WEIGHT);
  return 0.78 - t * 0.5; // ranges roughly 0.78 (light) down to 0.28 (max fed)
}

export function applyWeightVisual(royalGroup, weight) {
  const t = Math.min(1, weight / MAX_WEIGHT);
  const torso = royalGroup.userData.torso;
  if (torso) {
    torso.scale.x = 1 + t * 0.95;
    torso.scale.z = 1 + t * 0.95;
    torso.scale.y = 1 - t * 0.12;
  }
  const head = royalGroup.children.find((c) => c.geometry && c.geometry.type === 'SphereGeometry');
  if (head) {
    const s = 1 + t * 0.35;
    head.scale.set(s, s, s);
  }
}
