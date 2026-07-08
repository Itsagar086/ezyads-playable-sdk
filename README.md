# Number Match — Premium Playable Ad

A fully self-contained, framework-free HTML5 playable ad for the **Number Match** mobile game. Players find pairs of numbers that are equal or sum to 10, guided through a 3-phase automated flow culminating in a CTA overlay.

---

## Folder Structure

```
num_match_ag_04/
├── index.html              # Entry point — markup only
├── css/
│   └── styles.css          # All visual styles (variables, layout, animations)
├── js/
│   ├── config.js           # SDK_CONFIG — board data, game settings, redirect URL
│   ├── analytics.js        # AnalyticsEngine — event tracking
│   ├── audio.js            # AudioEngine — Web Audio API synthesizer
│   ├── particles.js        # ParticleEngine — HTML5 Canvas particle system
│   ├── emotions.js         # EmotionEngine — floating emoji overlays
│   ├── score.js            # ScoreEngine + TimerEngine — scoring and CTA timer
│   ├── combo.js            # ComboSystem — combo streak badge
│   ├── aiAnalyzer.js       # AIAnalyzer — IQ panel state and animations
│   ├── tutorial.js         # TutorialEngine — hand animation tutorial loop
│   ├── gameEngine.js       # GameEngine — board logic, input, matching, angry mode
│   ├── playableFlow.js     # PlayableFlowEngine — 3-phase autoplay/player/CTA flow
│   ├── cta.js              # CTAEngine — outro overlay and store redirect
│   ├── gameFeel.js         # GameFeelEngine — micro-feedback animations
│   ├── utils.js            # Shared utilities (reserved for future helpers)
│   └── main.js             # Bootstrap — initializes all engines on DOMContentLoaded
├── assets/
│   ├── images/             # Raster images (reserved)
│   ├── audio/              # Audio files (reserved — currently synthesized)
│   ├── icons/              # Icon assets (reserved)
│   └── svg/                # SVG assets (reserved)
└── README.md
```

---

## How to Run Locally

No build tools required. Open directly in a browser:

```bash
# Option 1: Open file directly (Chrome/Edge)
open index.html

# Option 2: Serve with any static server to avoid CORS issues with file:// protocol
npx serve .
# or
python -m http.server 8080
```

Then navigate to `http://localhost:8080`.

> **Note:** Do not open `index.html` directly as a `file://` URL if you intend to add audio file assets later — the Web Audio API synthesizer works fine without a server.

---

## Architecture Overview

The game is a **plain HTML + CSS + JavaScript** application with no frameworks or build steps. All modules are loaded via standard `<script src="">` tags in the correct dependency order.

### Module Load Order

```
config.js         → defines SDK_CONFIG (no dependencies)
analytics.js      → AnalyticsEngine (no dependencies)
audio.js          → AudioEngine (depends on AnalyticsEngine)
particles.js      → ParticleEngine (depends on GameEngine reference — deferred)
emotions.js       → EmotionEngine (no dependencies)
score.js          → ScoreEngine + TimerEngine (depends on GameEngine, ComboSystem, GameFeelEngine, AnalyticsEngine)
combo.js          → ComboSystem (depends on AudioEngine, ParticleEngine)
aiAnalyzer.js     → AIAnalyzer (depends on GameEngine)
tutorial.js       → TutorialEngine (depends on GameEngine)
gameEngine.js     → GameEngine (depends on all engines above)
playableFlow.js   → PlayableFlowEngine (depends on GameEngine, TutorialEngine)
cta.js            → CTAEngine (depends on ScoreEngine, GameEngine, ParticleEngine, AnalyticsEngine, TimerEngine)
gameFeel.js       → GameFeelEngine (depends on GameEngine, AudioEngine)
utils.js          → utilities (no dependencies)
main.js           → bootstrap (depends on all engines)
```

### 3-Phase Playable Ad Flow

| Phase | Time | Description |
|-------|------|-------------|
| **AutoPlay** | 0–8s | Engine plays 5 pre-verified moves with hand animation. Player input disabled. |
| **Player** | 8–28s | Player input enabled. Hand guides the first move, then disappears. |
| **CTA** | 28s+ | CTA overlay appears with stats and install button. |

### Angry Mode

Triggered after 3 consecutive wrong matches. The UI switches to a crimson-black theme with aggressive audio. Cleared automatically on the next correct match.

---

## Module Descriptions

| File | Responsibility |
|------|---------------|
| `config.js` | All game constants: board grid, target score, CTA URL, timing |
| `analytics.js` | Lightweight console event logger with timestamps |
| `audio.js` | Procedural audio via Web Audio API (no audio files required) |
| `particles.js` | Canvas-based sparkle, smoke, and confetti particles |
| `emotions.js` | CSS-animated floating emoji reactions |
| `score.js` | Score state, rolling animation, accuracy tracking, CTA timer |
| `combo.js` | Combo streak popup with audio and confetti |
| `aiAnalyzer.js` | IQ panel — energy bar, tier badges, brain SVG glow states |
| `tutorial.js` | Looping hand-tap animation tutorial |
| `gameEngine.js` | Core board logic: grid state, match detection, path finding, clearing pairs |
| `playableFlow.js` | Orchestrates the 3-phase ad lifecycle |
| `cta.js` | Outro overlay, stat population, Play Store redirect |
| `gameFeel.js` | Cell pop/shake micro-animations, combo badges, CSS particles |
| `utils.js` | Reserved for shared helper functions |
| `main.js` | Single DOMContentLoaded bootstrap for all engines |

---

## Git Workflow Recommendations

```bash
# Initial commit
git init
git add .
git commit -m "feat: initial production modular structure"

# Feature branches
git checkout -b sprint/8-feature-name

# Hotfixes to production
git checkout -b hotfix/border-rendering

# Release tags
git tag -a v7.0.0 -m "Sprint 7: IQ Panel redesign + modular refactor"
git push origin --tags
```

### .gitignore

See `.gitignore` in project root. Excludes OS files, editor configs, and temporary folders.
