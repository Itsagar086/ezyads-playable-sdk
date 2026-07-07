# EzyAds Playable Ad SDK: Number Match

A premium, production-ready, single-file HTML5 Playable Ad for "Number Match" complying with Meta Playable Ads and Google App Campaigns specifications. 

## Features

- **Self-contained Architecture**: Includes HTML, CSS, synthesized audio (via Web Audio API), SVG assets, and particle systems in a single file, eliminating network requests.
- **AI Performance Analyzer**: A real-time player analysis bar that displays current skill tiers: `Quick Learner` 🟢, `Puzzle Solver` 🔵, `Math Master` 🟣.
- **Emotion Engine**: Interactive float-up emojis that react dynamically to positive matching streaks or mismatch attempts.
- **Combo Multiplier System**: Real-time streak tracking with screen shake, particle bursts, and golden multipliers.
- **Dynamic Gravity Slide-Down Physics**: When pairs are matched, numbers above them slide down, and empty cells bubble up to the top.
- **Configurable Outro Screen (CTA)**: Displays performance results, final score, streaks, accuracy, and interactive install triggers.

---

## 1. Config Object Structure

You can configure the behavior of the playable ad by editing the `SDK_CONFIG` variable at the top of the script tag in `index.html`:

```javascript
const SDK_CONFIG = {
  gameName: "Number Match",
  targetScore: 100,             // Score required for victory completion
  ctaLimitSeconds: 20,          // Auto-trigger CTA overlay after X seconds
  redirectUrl: "https://example.com/app-store-link", // Destination app store link
  theme: "space",               // Theme: "space", "neon", "candy", "cyberpunk"
  difficulty: "normal",
  board: {
    columns: 9,
    rows: 13,
    initialGrid: [
      // 9x13 double array containing numbers 1-9
    ]
  }
};
```

---

## 2. Supported Themes

You can swap themes instantly by editing the `theme` field in `SDK_CONFIG`:

- **`space`** (Default): Deep space navy blue gradients with soft purple hues.
- **`neon`**: Sleek black background with high-contrast electric pink, cyan, and glowing green accents.
- **`candy`**: Playful pink-cream aesthetic with soft violet grid headers and high-contrast numbers.
- **`cyberpunk`**: Industrial dark gray paired with bright magenta borders and light blue typography.

---

## 3. Analytics Tracking API

The SDK contains a modular `AnalyticsEngine` that logs player performance metrics and communicates events to external wrappers.

Standard events tracked:
- `game_started`: Triggers on window load.
- `first_interaction`: Dispatched upon the player's initial touch gesture.
- `correct_match`: Triggered on successfully clearing a pair. Passes current score, combo streak, and accuracy metrics.
- `wrong_match`: Triggered on a validation mismatch. Passes accuracy metrics.
- `cta_viewed`: Dispatched when the Outro card overlays the viewport. Passes final score, accuracy, streak, and skill tier.
- `cta_clicked`: Triggered when clicking "Install Now" or "Continue".
- `audio_muted` / `audio_unmuted`: Dispatched when toggling the mute button.

To attach custom reporting backends (e.g. Meta Pixel, Unity Analytics):
```javascript
// Modify tracking dispatcher in AnalyticsEngine.track:
track(eventName, data) {
  // Example for Google Analytics:
  if (typeof gtag !== "undefined") {
    gtag('event', eventName, data);
  }
}
```

---

## 4. Audio Synthesis (Web Audio API)

No external audio files are required. The SDK dynamically synthesizes audio chimes using raw oscillators:
- **Correct Match**: Upward arpeggio (`C5 -> E5 -> G5`).
- **Wrong Match**: Dual downward low-frequency triangle waves (`180Hz -> 150Hz`).
- **Combo/Streak**: Ascending pitch sweeps scaling with the current combo multiplier.
- **Victory Fanfare**: Ascending scale arpeggio.
- **Mute Integration**: Respects mobile user engagement policies; initializes audio nodes only after the first touch input.

