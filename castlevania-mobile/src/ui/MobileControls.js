// On-screen touch controls – D-pad left/right, jump button, attack button.
// Emits events on the scene that GameScene maps to cursors.
export class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.left = false;
    this.right = false;
    this.jump = false;
    this.attack = false;
    this._jumpJustDown = false;
    this._attackJustDown = false;

    const W = scene.scale.width;
    const H = scene.scale.height;
    const alpha = 0.55;
    const btnSz = 48;
    const pad = 14;

    // D-pad container
    const dpadX = pad + 56;
    const dpadY = H - pad - 56;

    this._leftBtn = this._makeBtn(scene, dpadX - 44, dpadY, '<', btnSz, alpha, 0x334466);
    this._rightBtn = this._makeBtn(scene, dpadX + 44, dpadY, '>', btnSz, alpha, 0x334466);

    // Action buttons
    const rightX = W - pad - 56;
    this._jumpBtn = this._makeBtn(scene, rightX, dpadY - 36, 'B', btnSz, alpha, 0x443355, 0xcc44ff);
    this._attackBtn = this._makeBtn(scene, rightX - 52, dpadY + 10, 'A', btnSz, alpha, 0x553344, 0xff4444);

    this._setupInput();
  }

  _makeBtn(scene, x, y, label, size, alpha, bg = 0x334455, textColor = 0xffffff) {
    const g = scene.add.graphics();
    g.fillStyle(bg, alpha);
    g.fillCircle(0, 0, size / 2);
    g.lineStyle(2, textColor, alpha * 0.8);
    g.strokeCircle(0, 0, size / 2);
    g.setPosition(x, y);
    g.setScrollFactor(0);
    g.setDepth(50);
    g.setInteractive(new Phaser.Geom.Circle(0, 0, size / 2), Phaser.Geom.Circle.Contains);

    const text = scene.add.text(x, y, label, {
      fontSize: '18px', fontFamily: 'monospace',
      color: '#' + textColor.toString(16).padStart(6, '0'),
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

    return { g, text, x, y, size };
  }

  _setupInput() {
    const scene = this.scene;

    const checkTouch = (pointer, phase) => {
      const touches = scene.input.manager.pointers;
      this.left = false;
      this.right = false;

      let jumpNow = false;
      let attackNow = false;

      for (const p of touches) {
        if (!p.isDown) continue;
        const wx = p.x;
        const wy = p.y;

        if (this._hitTest(wx, wy, this._leftBtn)) this.left = true;
        if (this._hitTest(wx, wy, this._rightBtn)) this.right = true;
        if (this._hitTest(wx, wy, this._jumpBtn)) jumpNow = true;
        if (this._hitTest(wx, wy, this._attackBtn)) attackNow = true;
      }

      this._jumpJustDown = jumpNow && !this.jump;
      this._attackJustDown = attackNow && !this.attack;
      this.jump = jumpNow;
      this.attack = attackNow;
    };

    scene.input.on('pointermove', checkTouch);
    scene.input.on('pointerdown', checkTouch);
    scene.input.on('pointerup', checkTouch);
  }

  _hitTest(px, py, btn) {
    const dx = px - btn.x;
    const dy = py - btn.y;
    return Math.hypot(dx, dy) <= btn.size / 2 + 6;
  }

  isLeftDown() { return this.left; }
  isRightDown() { return this.right; }
  isJumpJustDown() {
    const v = this._jumpJustDown;
    this._jumpJustDown = false;
    return v;
  }
  isAttackJustDown() {
    const v = this._attackJustDown;
    this._attackJustDown = false;
    return v;
  }

  destroy() {
    [this._leftBtn, this._rightBtn, this._jumpBtn, this._attackBtn].forEach(b => {
      b.g.destroy();
      b.text.destroy();
    });
  }
}
