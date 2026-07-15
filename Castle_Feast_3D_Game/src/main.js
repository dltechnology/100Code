import './style.css';
import { Game } from './game/Game.js';
import * as HUD from './ui/HUD.js';

HUD.showScreen('loading-screen');

const canvas = document.getElementById('scene');
const game = new Game(canvas);

requestAnimationFrame(() => {
  HUD.populateClassSelect((id) => { game.selectedClass = id; });
  HUD.showScreen('title-screen');
});

document.getElementById('start-btn').addEventListener('click', () => {
  HUD.showScreen('hud');
  game.startMatch(game.selectedClass);
});

document.getElementById('restart-btn').addEventListener('click', () => {
  HUD.showScreen('title-screen');
});

document.getElementById('how-to-toggle').addEventListener('click', () => {
  document.getElementById('how-to-panel').classList.toggle('hidden');
});
