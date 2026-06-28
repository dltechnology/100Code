import { COLORS } from './Constants.js';

// Generates all procedural textures at boot time so scenes can use them as sprites.
export function generateTextures(scene) {
  _player(scene);
  _sword(scene);
  _skeleton(scene);
  _bat(scene);
  _ghost(scene);
  _medusa(scene);
  _boneDragon(scene);
  _giantSpider(scene);
  _stone(scene);
  _stoneDark(scene);
  _cave(scene);
  _caveDark(scene);
  _candle(scene);
  _heart(scene);
  _gold(scene);
  _soul(scene);
  _torch(scene);
  _water(scene);
  _lava(scene);
  _projectile(scene);
  _bossProjectile(scene);
  _spiderWeb(scene);
  _boneFragment(scene);
  _particle(scene);
}

function gfx(scene, key, w, h, fn) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  fn(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function _player(scene) {
  gfx(scene, 'player', 24, 36, g => {
    // Cape
    g.fillStyle(0x880000);
    g.fillRect(4, 10, 16, 22);
    // Body
    g.fillStyle(COLORS.PLAYER_DARK);
    g.fillRect(6, 8, 12, 14);
    // Head
    g.fillStyle(0xddccbb);
    g.fillRect(7, 0, 10, 10);
    // Hair
    g.fillStyle(0x220000);
    g.fillRect(6, 0, 12, 4);
    // Belt
    g.fillStyle(COLORS.GOLD);
    g.fillRect(6, 20, 12, 2);
    // Legs
    g.fillStyle(0x333388);
    g.fillRect(6, 22, 5, 10);
    g.fillRect(13, 22, 5, 10);
    // Boots
    g.fillStyle(0x221100);
    g.fillRect(5, 30, 6, 6);
    g.fillRect(13, 30, 6, 6);
    // Shoulder armor
    g.fillStyle(0x666688);
    g.fillRect(2, 8, 6, 5);
    g.fillRect(16, 8, 6, 5);
  });
}

function _sword(scene) {
  gfx(scene, 'sword_slash', 48, 24, g => {
    g.fillStyle(COLORS.PLAYER_SWORD, 0.7);
    g.fillRect(0, 8, 40, 8);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(0, 10, 44, 4);
    g.fillStyle(COLORS.GOLD, 0.9);
    g.fillRect(0, 11, 8, 2);
  });
}

function _skeleton(scene) {
  gfx(scene, 'skeleton', 22, 34, g => {
    // Head skull
    g.fillStyle(COLORS.SKELETON);
    g.fillRect(5, 0, 12, 10);
    g.fillStyle(0x000000);
    g.fillRect(7, 3, 3, 3);
    g.fillRect(12, 3, 3, 3);
    g.fillRect(8, 8, 6, 2);
    // Ribcage
    g.fillStyle(COLORS.SKELETON);
    g.fillRect(6, 10, 10, 12);
    g.fillStyle(COLORS.SKELETON_DARK);
    for (let i = 0; i < 4; i++) g.fillRect(6, 11 + i * 3, 10, 1);
    // Arms
    g.fillStyle(COLORS.SKELETON);
    g.fillRect(1, 10, 5, 10);
    g.fillRect(16, 10, 5, 10);
    // Legs
    g.fillRect(6, 22, 4, 12);
    g.fillRect(12, 22, 4, 12);
    // Sword
    g.fillStyle(0x888899);
    g.fillRect(17, 8, 2, 18);
    g.fillStyle(0xaaaacc);
    g.fillRect(15, 12, 6, 2);
  });
}

function _bat(scene) {
  gfx(scene, 'bat', 32, 16, g => {
    // Wings
    g.fillStyle(COLORS.BAT_WING);
    g.fillTriangle(0, 12, 14, 4, 16, 14);
    g.fillTriangle(32, 12, 18, 4, 16, 14);
    g.fillStyle(COLORS.BAT);
    g.fillRect(2, 8, 12, 6);
    g.fillRect(18, 8, 12, 6);
    // Body
    g.fillStyle(0x220033);
    g.fillRect(12, 2, 8, 12);
    // Eyes
    g.fillStyle(0xff2222);
    g.fillRect(13, 4, 2, 2);
    g.fillRect(17, 4, 2, 2);
  });
}

function _ghost(scene) {
  gfx(scene, 'ghost', 26, 30, g => {
    g.fillStyle(COLORS.GHOST, 0.85);
    g.fillRect(4, 6, 18, 18);
    g.fillRect(1, 4, 24, 16);
    g.fillRect(4, 20, 18, 8);
    // Wavy bottom
    g.fillStyle(0x000000, 0);
    for (let i = 0; i < 3; i++) {
      g.fillStyle(0x000000);
      g.fillRect(4 + i * 6, 26, 4, 4);
    }
    g.fillStyle(0x88aacc, 0.85);
    g.fillRect(4, 22, 18, 4);
    // Eyes
    g.fillStyle(0x112244);
    g.fillRect(7, 10, 4, 5);
    g.fillRect(15, 10, 4, 5);
    // Glow overlay
    g.fillStyle(0xaaccee, 0.3);
    g.fillRect(6, 4, 14, 10);
  });
}

function _medusa(scene) {
  gfx(scene, 'medusa', 28, 28, g => {
    // Snake body
    g.fillStyle(COLORS.MEDUSA);
    g.fillRect(8, 8, 12, 14);
    // Head
    g.fillRect(7, 2, 14, 10);
    // Hair snakes
    g.fillStyle(0x226633);
    g.fillRect(2, 0, 4, 8);
    g.fillRect(12, 0, 4, 8);
    g.fillRect(22, 0, 4, 8);
    g.fillStyle(0xff4400);
    g.fillRect(2, 0, 4, 2);
    g.fillRect(12, 0, 4, 2);
    g.fillRect(22, 0, 4, 2);
    // Eyes
    g.fillStyle(0xff8800);
    g.fillRect(9, 4, 3, 4);
    g.fillRect(16, 4, 3, 4);
    // Tail
    g.fillStyle(COLORS.MEDUSA);
    g.fillRect(10, 20, 8, 8);
    g.fillRect(12, 26, 4, 4);
  });
}

function _boneDragon(scene) {
  gfx(scene, 'bone_dragon', 120, 80, g => {
    const c = COLORS.SKELETON;
    const d = COLORS.SKELETON_DARK;
    // Main body segments
    for (let i = 0; i < 5; i++) {
      g.fillStyle(c);
      g.fillRect(10 + i * 18, 30 + Math.abs(i - 2) * 4, 16, 16);
      g.fillStyle(d);
      g.fillRect(12 + i * 18, 32 + Math.abs(i - 2) * 4, 12, 4);
    }
    // Head
    g.fillStyle(c);
    g.fillRect(86, 20, 30, 24);
    // Jaws
    g.fillRect(96, 40, 20, 6);
    // Teeth
    g.fillStyle(0xffffff);
    for (let i = 0; i < 4; i++) g.fillRect(98 + i * 5, 40, 3, 4);
    // Eyes
    g.fillStyle(0xff3300);
    g.fillRect(90, 24, 6, 6);
    g.fillRect(102, 24, 6, 6);
    // Wings
    g.fillStyle(d);
    g.fillTriangle(10, 30, 0, 0, 40, 20);
    g.fillTriangle(100, 30, 120, 0, 80, 20);
  });
}

function _giantSpider(scene) {
  gfx(scene, 'giant_spider', 100, 80, g => {
    // Legs
    g.fillStyle(0x332211);
    for (let i = 0; i < 4; i++) {
      const x = i < 2 ? 5 : 75;
      const y = 20 + i % 2 * 20;
      g.fillRect(x, y, 25, 5);
      g.fillRect(i < 2 ? 0 : 80, y + 5, 20, 5);
    }
    // Abdomen
    g.fillStyle(0x551100);
    g.fillRect(10, 30, 45, 40);
    g.fillStyle(0x773322);
    g.fillRect(15, 35, 35, 30);
    // Markings
    g.fillStyle(0xff4400);
    g.fillRect(20, 38, 25, 4);
    g.fillRect(23, 46, 18, 4);
    // Head
    g.fillStyle(0x442200);
    g.fillRect(45, 25, 40, 35);
    // Eyes (8 eyes!)
    g.fillStyle(0xffcc00);
    const eyes = [[50,28],[58,28],[66,28],[74,28],[52,35],[60,35],[68,35],[74,35]];
    eyes.forEach(([ex, ey]) => g.fillRect(ex, ey, 4, 4));
    // Fangs
    g.fillStyle(0xcccccc);
    g.fillRect(52, 56, 6, 8);
    g.fillRect(66, 56, 6, 8);
    g.fillStyle(0x00ff00);
    g.fillRect(54, 62, 2, 2);
    g.fillRect(68, 62, 2, 2);
  });
}

function _stone(scene) {
  gfx(scene, 'stone', 32, 16, g => {
    g.fillStyle(COLORS.STONE_MID);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(COLORS.STONE_EDGE);
    g.fillRect(0, 0, 32, 3);
    g.fillStyle(COLORS.STONE_DARK);
    g.fillRect(0, 13, 32, 3);
    g.fillRect(16, 3, 1, 10);
    g.fillRect(0, 8, 16, 1);
  });
}

function _stoneDark(scene) {
  gfx(scene, 'stone_dark', 32, 16, g => {
    g.fillStyle(0x443322);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(0x554433);
    g.fillRect(0, 0, 32, 3);
    g.fillStyle(0x221100);
    g.fillRect(0, 13, 32, 3);
    g.fillRect(16, 3, 1, 10);
    g.fillRect(0, 8, 16, 1);
  });
}

function _cave(scene) {
  gfx(scene, 'cave', 32, 16, g => {
    g.fillStyle(COLORS.CAVE_MID);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(COLORS.CAVE_LIGHT);
    g.fillRect(0, 0, 32, 2);
    g.fillStyle(COLORS.CAVE_DARK);
    g.fillRect(0, 14, 32, 2);
    g.fillRect(10, 2, 1, 12);
    g.fillRect(22, 2, 1, 12);
  });
}

function _caveDark(scene) {
  gfx(scene, 'cave_dark', 32, 16, g => {
    g.fillStyle(0x221100);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(0x332211);
    g.fillRect(0, 0, 32, 2);
    g.fillStyle(0x110800);
    g.fillRect(0, 14, 32, 2);
  });
}

function _candle(scene) {
  gfx(scene, 'candle', 12, 20, g => {
    // Flame
    g.fillStyle(COLORS.TORCH_FIRE);
    g.fillRect(4, 0, 4, 6);
    g.fillStyle(0xffff00);
    g.fillRect(5, 1, 2, 3);
    // Wax
    g.fillStyle(0xeeddcc);
    g.fillRect(3, 6, 6, 10);
    // Stand
    g.fillStyle(0x885533);
    g.fillRect(1, 15, 10, 5);
  });
}

function _heart(scene) {
  gfx(scene, 'heart', 12, 12, g => {
    g.fillStyle(COLORS.HEART);
    g.fillRect(1, 3, 4, 4);
    g.fillRect(7, 3, 4, 4);
    g.fillRect(0, 4, 12, 4);
    g.fillRect(2, 7, 8, 3);
    g.fillRect(4, 9, 4, 3);
    g.fillStyle(0xff88aa);
    g.fillRect(2, 4, 2, 2);
    g.fillRect(8, 4, 2, 2);
  });
}

function _gold(scene) {
  gfx(scene, 'gold', 10, 10, g => {
    g.fillStyle(COLORS.GOLD);
    g.fillRect(2, 0, 6, 10);
    g.fillRect(0, 2, 10, 6);
    g.fillStyle(0xffff88);
    g.fillRect(3, 1, 4, 2);
  });
}

function _soul(scene) {
  gfx(scene, 'soul', 14, 14, g => {
    g.fillStyle(COLORS.SOUL, 0.8);
    g.fillRect(3, 1, 8, 12);
    g.fillRect(1, 3, 12, 8);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(4, 2, 6, 4);
    // Yin-yang like
    g.fillStyle(0x224488, 0.4);
    g.fillRect(4, 8, 6, 4);
  });
}

function _torch(scene) {
  gfx(scene, 'torch', 10, 24, g => {
    g.fillStyle(COLORS.TORCH_FIRE);
    g.fillRect(3, 0, 4, 8);
    g.fillStyle(0xffff00);
    g.fillRect(4, 1, 2, 4);
    g.fillStyle(0x885533);
    g.fillRect(4, 8, 2, 12);
    g.fillStyle(0x554422);
    g.fillRect(1, 18, 8, 6);
  });
}

function _water(scene) {
  gfx(scene, 'water', 32, 16, g => {
    g.fillStyle(COLORS.WATER, 0.8);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(COLORS.WATER_LIGHT, 0.5);
    g.fillRect(0, 0, 32, 4);
    g.fillRect(4, 6, 8, 2);
    g.fillRect(20, 6, 8, 2);
  });
}

function _lava(scene) {
  gfx(scene, 'lava', 32, 16, g => {
    g.fillStyle(COLORS.LAVA, 0.9);
    g.fillRect(0, 0, 32, 16);
    g.fillStyle(COLORS.LAVA_GLOW, 0.7);
    g.fillRect(0, 0, 32, 4);
    g.fillRect(6, 5, 6, 3);
    g.fillRect(20, 5, 6, 3);
    g.fillStyle(0xffff00, 0.3);
    g.fillRect(8, 6, 2, 2);
    g.fillRect(22, 6, 2, 2);
  });
}

function _projectile(scene) {
  gfx(scene, 'projectile', 14, 8, g => {
    g.fillStyle(0x88eeff);
    g.fillRect(0, 3, 14, 2);
    g.fillStyle(0xffffff);
    g.fillRect(4, 2, 6, 4);
    g.fillStyle(0x4488ff, 0.5);
    g.fillRect(0, 2, 4, 4);
  });
}

function _bossProjectile(scene) {
  gfx(scene, 'boss_projectile', 16, 16, g => {
    g.fillStyle(0xff6600, 0.8);
    g.fillRect(4, 0, 8, 16);
    g.fillRect(0, 4, 16, 8);
    g.fillStyle(0xffcc00, 0.9);
    g.fillRect(6, 2, 4, 12);
    g.fillRect(2, 6, 12, 4);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(7, 7, 2, 2);
  });
}

function _spiderWeb(scene) {
  gfx(scene, 'spider_web', 20, 40, g => {
    g.fillStyle(0xddddcc, 0.7);
    g.fillRect(9, 0, 2, 40);
    g.fillRect(0, 10, 20, 2);
    g.fillRect(2, 20, 16, 2);
    g.fillRect(4, 30, 12, 2);
    g.fillStyle(0xeeeedd, 0.5);
    g.fillRect(5, 5, 10, 1);
    g.fillRect(3, 15, 14, 1);
  });
}

function _boneFragment(scene) {
  gfx(scene, 'bone_fragment', 10, 8, g => {
    g.fillStyle(COLORS.SKELETON);
    g.fillRect(0, 3, 10, 2);
    g.fillRect(1, 1, 3, 6);
    g.fillRect(6, 1, 3, 6);
  });
}

function _particle(scene) {
  gfx(scene, 'particle', 4, 4, g => {
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 4, 4);
  });
}
