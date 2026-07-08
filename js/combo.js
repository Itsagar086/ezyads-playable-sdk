// ==========================================
// 7. COMBO SYSTEM
// ==========================================
const ComboSystem = {
  popup: null,

  init() {
    this.popup = document.getElementById("combo-popup");
  },

  show(streak) {
    this.popup.innerText = `x${streak}`;
    this.popup.className = "combo-badge-overlay active";
    AudioEngine.playCombo(streak);

    if (streak >= 3) {
      document.getElementById("app-container").classList.add("shake");
      setTimeout(() => document.getElementById("app-container").classList.remove("shake"), 350);
    }
    if (streak >= 4) {
      ParticleEngine.spawnConfetti();
    }

    setTimeout(() => {
      this.popup.className = "combo-badge-overlay";
    }, 1100);
  }
};
