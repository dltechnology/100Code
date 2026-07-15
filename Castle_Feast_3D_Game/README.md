# Castle Feast

A 3D castle-siege game you can play in a phone browser (iPhone or Android,
no app install needed). Pick a hero, storm the enemy castle through hazards
and river crossings, break their gate and cage, then carry their royal all
the way back to your own base to win — while feeding cake to *your* royal
back home to fatten her up and slow down anyone who tries to steal her.

This is an original game built from scratch (procedural low-poly 3D models,
original level, original rules) inspired by the general "siege + capture +
fatten the hostage" genre of party games. It does not use any trademarked
names, characters, or art from any existing game.

## Run it

```bash
npm install
npm run dev -- --host
```

Vite will print a `Local` URL (for your own machine) and a `Network` URL
like `http://192.168.x.x:5173`. Open the **Network** URL on your phone
while it's on the same Wi-Fi to play on iPhone or Android in Safari/Chrome.

For a faster, production-optimized build:

```bash
npm run build
npm run preview -- --host
```

### Turning it into an installable app (optional next step)

This is a standard web app, so it can be wrapped into real iOS/Android app
packages with [Capacitor](https://capacitorjs.com/) (`npx cap init`, `npx cap
add ios`, `npx cap add android`) once you have Xcode (Mac) and/or Android
Studio available to build and sign it. Not included here since it needs
those platform toolchains.

## How to play

- **Move**: left virtual joystick. **Attack**: bottom-right button. **Jump**:
  bottom-left of the pair. **Use**: context button for feeding/pickup.
- Walk up to your own royal's cage and hold **Use** to feed her cake — she
  gets visibly fatter and any enemy who eventually steals her carries her
  much more slowly, buying your team time to catch up.
- Break the enemy gate (**Attack** it), then break their royal's cage lock,
  then walk up to her and hold **Use** to pick her up.
- Carry her all the way back to **your own** glowing return circle to win.
  You can't attack while carrying her, so bring an escort.
- If your carrier gets knocked out, she drops on the spot — anyone can grab
  her: your own team instantly rescues her home, the enemy resumes the run.
- Two bridges cross the river in the middle, each with a hazard: a swinging
  log (jump to dodge it) and a periodic spike trap.
- Three classes: **Warrior** (tanky melee), **Ranger** (ranged, auto-aims at
  the nearest enemy in range), **Chef** (feeds royals faster, decent melee).

## Scope of this build

Single-player vs. AI bots (5v5, no server/networking) with a 5-minute
match timer; first team to complete a carry wins, otherwise it's a draw.
Built with [Three.js](https://threejs.org/) + [Vite](https://vitejs.dev/),
custom lightweight physics (no external physics engine), and a hand-rolled
touch-joystick UI — everything renders from code, no external art/model
assets.

## Project layout

```
src/
  core/        Physics (gravity + collision) and the touch/keyboard InputController
  game/        Arena (level geometry), Characters (classes + procedural models),
               Entity/Player/AI (movement, combat, behavior), Princess (royal
               feed/carry state machine), Game (orchestration + game loop)
  ui/          HUD/DOM overlay updates
  main.js      Entry point wiring the title screen to the game
```
