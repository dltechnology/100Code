import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { Level1Scene } from './scenes/Level1Scene.js';
import { Level2Scene } from './scenes/Level2Scene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { HUDScene } from './ui/HUD.js';

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  backgroundColor: '#000000',
  parent: 'game',
  pixelArt: true,
  antialias: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 270
  },
  scene: [BootScene, MenuScene, HUDScene, Level1Scene, Level2Scene, GameOverScene, VictoryScene]
};

const game = new Phaser.Game(config);
