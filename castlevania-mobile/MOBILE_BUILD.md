# Shadow Castle — Mobile Build Guide

## Play instantly in browser
Open `index.html` in any modern browser. Works on mobile browsers too.

## Package as native iOS / Android app (Capacitor)

```bash
npm install

# Initialize Capacitor (one-time)
npm run cap:init

# Add platforms
npm run cap:add:ios       # Requires macOS + Xcode
npm run cap:add:android   # Requires Android Studio

# Sync web assets to native
npm run cap:sync

# Open in native IDE to build & deploy
npm run cap:open:ios
npm run cap:open:android
```

## Controls
| Input | Action |
|-------|--------|
| Arrow Left/Right | Move |
| Arrow Up / X key | Jump (press twice for double jump) |
| Z key | Attack |
| On-screen D-pad | Move (mobile) |
| On-screen A button | Attack (mobile) |
| On-screen B button | Jump (mobile) |

## Levels
1. **Castle Entrance** — Navigate Gothic castle platforms, fight Skeletons and Bats, defeat the **Bone Dragon** boss
2. **Underground Caverns** — Explore dark cave systems with water hazards, fight Ghosts, Medusa Heads, and Bats, defeat the **Giant Spider** boss

## Loot
- **Heart** — Restores 25 HP
- **Gold** — +50 Score  
- **Soul** — Increases soul count (Aria of Sorrow homage)
