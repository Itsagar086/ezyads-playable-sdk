// ==========================================
// 12. GAME FEEL ENGINE
// ==========================================
const GameFeelEngine = {

  init() {
    // Stateless — all methods work on demand
  },

  // Correct match: pop both matched cells
  showCorrectFeedback(elA, elB) {
    [elA, elB].forEach(el => {
      if (!el) return;
      el.classList.remove("cell-pop");
      void el.offsetWidth; // reflow to restart animation
      el.classList.add("cell-pop");
      setTimeout(() => el.classList.remove("cell-pop"), 220);
    });
  },

  // Wrong match: shake the tapped cell
  showWrongFeedback(cellEl) {
    if (!cellEl) return;
    cellEl.classList.remove("cell-shake");
    void cellEl.offsetWidth;
    cellEl.classList.add("cell-shake");
    setTimeout(() => cellEl.classList.remove("cell-shake"), 280);
  },

  // Combo streak: show floating badge (2+ streak)
  showComboFeedback(streak) {
    if (streak < 2) return;
    const appEl = document.getElementById("app-container");
    if (!appEl) return;

    let text, bg;
    if (streak >= 5) { text = "Brilliant! \uD83C\uDFC6"; bg = "rgba(239,68,68,0.92)"; }
    else if (streak >= 4) { text = "Awesome! \uD83E\uDD29"; bg = "rgba(168,85,247,0.92)"; }
    else if (streak >= 3) { text = "Great! \uD83D\uDE0E"; bg = "rgba(59,130,246,0.92)"; }
    else { text = "Nice! \uD83D\uDE0A"; bg = "rgba(16,185,129,0.92)"; }

    const badge = document.createElement("div");
    badge.className = "gfe-combo-badge";
    badge.innerText = text;
    badge.style.background = bg;
    appEl.appendChild(badge);
    setTimeout(() => badge.remove(), 1000);
  },

  // Floating score label — delegates to existing GameEngine method
  showFloatingScore(text, x, y) {
    GameEngine.spawnFloatingScore(text, x, y);
  },

  // Sound delegates — respect existing mute state via AudioEngine
  playSuccessSound() { AudioEngine.playCorrect(); },
  playErrorSound() { AudioEngine.playClick(); },

  // CSS-only particle burst at (x, y) relative to app-container
  spawnParticles(x, y) {
    const appEl = document.getElementById("app-container");
    if (!appEl) return;
    const palette = ["#ffaa00", "#10b981", "#3b82f6", "#f472b6", "#a855f7", "#ef4444", "#fbbf24", "#34d399"];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "gfe-particle";
      const angle = (360 / count) * i;
      const dist = 24 + Math.random() * 22;
      const rad = angle * Math.PI / 180;
      const tx = Math.round(Math.cos(rad) * dist);
      const ty = Math.round(Math.sin(rad) * dist);
      const dur = 500 + Math.floor(Math.random() * 160);
      p.style.cssText =
        `left:${x}px;top:${y}px;background:${palette[i % palette.length]};` +
        `--gfe-tx:${tx}px;--gfe-ty:${ty}px;--gfe-dur:${dur}ms;`;
      appEl.appendChild(p);
      setTimeout(() => p.remove(), dur + 60);
    }
  }
};
