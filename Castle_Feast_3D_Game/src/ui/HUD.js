import { CLASSES } from '../game/Characters.js';

export function populateClassSelect(onSelect) {
  const container = document.getElementById('class-select');
  container.innerHTML = '';
  let selected = 'warrior';

  const render = () => {
    container.innerHTML = '';
    for (const cls of Object.values(CLASSES)) {
      const card = document.createElement('div');
      card.className = 'class-card' + (cls.id === selected ? ' selected' : '');
      card.innerHTML = `
        <div class="swatch" style="background:#${cls.color.toString(16).padStart(6, '0')}"></div>
        <h3>${cls.name}</h3>
        <p>${cls.desc}</p>
      `;
      card.addEventListener('click', () => {
        selected = cls.id;
        onSelect(selected);
        render();
      });
      container.appendChild(card);
    }
  };
  render();
  onSelect(selected);
}

export function setLoading(text) {
  const el = document.getElementById('loading-text');
  if (el) el.textContent = text;
}

export function showScreen(id) {
  for (const s of ['loading-screen', 'title-screen', 'hud', 'end-screen']) {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  }
}

function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function updateHUD({ timeLeft, royals, playerHp, playerMaxHp, carrying, objective }) {
  document.getElementById('timer').textContent = fmtTime(timeLeft);
  document.getElementById('gold-royal-fill').style.width = `${royals.gold.weight}%`;
  document.getElementById('crimson-royal-fill').style.width = `${royals.crimson.weight}%`;
  document.getElementById('hp-fill').style.width = `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`;
  document.getElementById('carry-indicator').classList.toggle('hidden', !carrying);
  document.getElementById('objective-banner').textContent = objective || '';
}

export function showEndScreen(result) {
  showScreen('end-screen');
  const title = document.getElementById('end-title');
  const sub = document.getElementById('end-sub');
  if (result.winner === 'draw') {
    title.textContent = 'TIME’S UP';
    title.style.color = '#c9b8e8';
    sub.textContent = 'Neither royal made it home. Call it a draw.';
  } else if (result.winner === result.playerTeam) {
    title.textContent = 'VICTORY';
    title.style.color = '#ffd35c';
    sub.textContent = 'Your team carried the rival royal all the way home!';
  } else {
    title.textContent = 'DEFEAT';
    title.style.color = '#ff7a6b';
    sub.textContent = 'The enemy carried your royal back to their castle.';
  }
}
