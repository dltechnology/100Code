// Unified input: virtual joystick + on-screen buttons for touch, WASD/mouse for desktop testing.
export class InputController {
  constructor() {
    this.move = { x: 0, y: 0 }; // -1..1
    this.buttons = { attack: false, interact: false, jump: false };
    this._justPressed = { attack: false, interact: false, jump: false };

    this._joyActive = false;
    this._joyTouchId = null;
    this._joyOrigin = { x: 0, y: 0 };

    this._keys = new Set();

    this._setupJoystick();
    this._setupButtons();
    this._setupKeyboard();
  }

  _setupJoystick() {
    const zone = document.getElementById('joystick-zone');
    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');
    if (!zone || !base || !knob) return;

    const maxRadius = 46;

    const start = (id, clientX, clientY) => {
      this._joyActive = true;
      this._joyTouchId = id;
      const rect = base.getBoundingClientRect();
      this._joyOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      updateKnob(clientX, clientY);
    };

    const updateKnob = (clientX, clientY) => {
      let dx = clientX - this._joyOrigin.x;
      let dy = clientY - this._joyOrigin.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      this.move.x = dx / maxRadius;
      this.move.y = dy / maxRadius;
    };

    const end = () => {
      this._joyActive = false;
      this._joyTouchId = null;
      this.move.x = 0;
      this.move.y = 0;
      knob.style.transform = 'translate(-50%, -50%)';
    };

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      start(t.identifier, t.clientX, t.clientY);
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this._joyTouchId) updateKnob(t.clientX, t.clientY);
      }
    }, { passive: false });

    const touchEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._joyTouchId) end();
      }
    };
    zone.addEventListener('touchend', touchEnd);
    zone.addEventListener('touchcancel', touchEnd);

    // Mouse fallback for desktop testing
    zone.addEventListener('mousedown', (e) => start('mouse', e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => { if (this._joyActive && this._joyTouchId === 'mouse') updateKnob(e.clientX, e.clientY); });
    window.addEventListener('mouseup', () => { if (this._joyTouchId === 'mouse') end(); });
  }

  _setupButtons() {
    const bind = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      const press = (e) => {
        e.preventDefault();
        if (!this.buttons[key]) this._justPressed[key] = true;
        this.buttons[key] = true;
      };
      const release = (e) => {
        e.preventDefault();
        this.buttons[key] = false;
      };
      el.addEventListener('touchstart', press, { passive: false });
      el.addEventListener('touchend', release);
      el.addEventListener('touchcancel', release);
      el.addEventListener('mousedown', press);
      el.addEventListener('mouseup', release);
      el.addEventListener('mouseleave', release);
    };
    bind('btn-attack', 'attack');
    bind('btn-interact', 'interact');
    bind('btn-jump', 'jump');
  }

  _setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this._keys.add(e.code);
      if (e.code === 'Space' && !this.buttons.jump) this._justPressed.jump = true;
      if (e.code === 'Space') this.buttons.jump = true;
      if (e.code === 'KeyF') { if (!this.buttons.interact) this._justPressed.interact = true; this.buttons.interact = true; }
      if (e.code === 'KeyJ' || e.code === 'ShiftLeft') { if (!this.buttons.attack) this._justPressed.attack = true; this.buttons.attack = true; }
    });
    window.addEventListener('keyup', (e) => {
      this._keys.delete(e.code);
      if (e.code === 'Space') this.buttons.jump = false;
      if (e.code === 'KeyF') this.buttons.interact = false;
      if (e.code === 'KeyJ' || e.code === 'ShiftLeft') this.buttons.attack = false;
    });
  }

  // Call once per frame after consuming edge-triggered presses
  update() {
    const k = this._keys;
    let x = 0, y = 0;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (k.has('KeyW') || k.has('ArrowUp')) y -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) y += 1;
    if (!this._joyActive && (x !== 0 || y !== 0)) {
      const len = Math.hypot(x, y) || 1;
      this.move.x = x / len;
      this.move.y = y / len;
    } else if (!this._joyActive) {
      this.move.x = 0;
      this.move.y = 0;
    }
  }

  consumeJustPressed(key) {
    const v = this._justPressed[key];
    this._justPressed[key] = false;
    return v;
  }
}
