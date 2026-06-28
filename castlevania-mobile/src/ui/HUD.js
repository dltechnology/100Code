// Heads-up display overlay (HP, boss HP, score, souls).
// Runs as a separate overlay scene on top of game scenes.
export class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUD' });
  }

  create() {
    const W = this.scale.width;

    // Player HP bar
    this._hpBg = this._bar(4, 4, 120, 12, 0x440000);
    this._hpBar = this._bar(4, 4, 120, 12, 0xcc2222);
    this._hpIcon = this.add.image(4, 10, 'heart').setOrigin(0, 0.5).setScale(0.9).setDepth(52);
    this._hpLabel = this._label(18, 4, 'HP', 0xff6666);

    // Score
    this._scoreText = this.add.text(W / 2, 4, 'SCORE: 0', {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#ffdd88', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(52).setScrollFactor(0);

    // Soul counter
    this._soulText = this.add.text(W - 4, 4, '✦ 0', {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#88ffff', stroke: '#000', strokeThickness: 2
    }).setOrigin(1, 0).setDepth(52).setScrollFactor(0);

    // Boss bar (hidden until boss fight)
    this._bossBg = this._bar(W / 2 - 100, this.scale.height - 22, 200, 12, 0x442200)
      .setVisible(false);
    this._bossBar = this._bar(W / 2 - 100, this.scale.height - 22, 200, 12, 0xdd8800)
      .setVisible(false);
    this._bossLabel = this.add.text(W / 2, this.scale.height - 36, '', {
      fontSize: '11px', fontFamily: 'monospace',
      color: '#ffcc44', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(52).setScrollFactor(0).setVisible(false);

    this._maxHp = 120;
    this._maxBossHp = 1;

    // Listen to game events
    this.scene.get('Level1') && this._bindEvents('Level1');
    this.scene.get('Level2') && this._bindEvents('Level2');
    this.events.on('bindLevel', key => this._bindEvents(key));
  }

  _bindEvents(sceneKey) {
    const target = this.scene.get(sceneKey);
    if (!target) return;
    target.events.on('playerDamaged', (hp, maxHp) => {
      this._maxHp = maxHp;
      this._updateHp(hp);
    });
    target.events.on('scoreChanged', score => {
      this._scoreText.setText('SCORE: ' + score.toLocaleString());
    });
    target.events.on('soulCollected', count => {
      this._soulText.setText('✦ ' + count);
    });
    target.events.on('bossAppeared', (name, maxHp) => {
      this._maxBossHp = maxHp;
      this._bossBg.setVisible(true);
      this._bossBar.setVisible(true).setDisplaySize(200, 12);
      this._bossLabel.setText(name).setVisible(true);
    });
    target.events.on('bossDamaged', (hp, maxHp) => {
      const ratio = Math.max(0, hp / maxHp);
      this._bossBar.setDisplaySize(Math.round(ratio * 200), 12);
    });
    target.events.on('bossDefeated', () => {
      this._bossBg.setVisible(false);
      this._bossBar.setVisible(false);
      this._bossLabel.setVisible(false);
    });
  }

  _updateHp(hp) {
    const ratio = Math.max(0, hp / this._maxHp);
    this._hpBar.setDisplaySize(Math.round(ratio * 120), 12);
    if (ratio < 0.25) this._hpBar.setFillStyle(0xff2222);
    else if (ratio < 0.5) this._hpBar.setFillStyle(0xff8800);
    else this._hpBar.setFillStyle(0xcc2222);
  }

  _bar(x, y, w, h, color) {
    return this.add.rectangle(x, y, w, h, color)
      .setOrigin(0, 0).setDepth(51).setScrollFactor(0);
  }

  _label(x, y, text, color) {
    return this.add.text(x, y + 1, text, {
      fontSize: '10px', fontFamily: 'monospace',
      color: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000', strokeThickness: 1
    }).setDepth(52).setScrollFactor(0);
  }
}
