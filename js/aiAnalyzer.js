// ==========================================
// 8. AI PERFORMANCE ANALYZER
// ==========================================
const AIAnalyzer = {
  energy: 0,
  visualEnergy: 0,
  tierBadge: null,
  tierText: null,
  energyGauge: null,
  emojiFace: null,

  init() {
    this.tierBadge = document.getElementById("ai-badge-tier");
    this.tierText = document.getElementById("ai-tier-text");
    this.energyGauge = document.getElementById("ai-energy-gauge");
    this.emojiFace = document.getElementById("ai-emoji-face");
    this.updateVisuals();
  },

  addEnergy(amount) {
    this.energy = Math.min(100, this.energy + amount);
    this.animateGauge();
    this.triggerBrainPulse();
  },

  deductEnergy(amount) {
    this.energy = Math.max(0, this.energy - amount);
    this.animateGauge();
    this.triggerBrainShake();
  },

  animateGauge() {
    const step = () => {
      const diff = this.energy - this.visualEnergy;
      if (Math.abs(diff) > 0.5) {
        this.visualEnergy += diff * 0.12;
        this.energyGauge.style.width = `${this.visualEnergy}%`;
        this.updateVisuals();
        requestAnimationFrame(step);
      } else {
        this.visualEnergy = this.energy;
        this.energyGauge.style.width = `${this.energy}%`;
        this.updateVisuals();
      }
    };
    requestAnimationFrame(step);
  },

  updateVisuals() {
    // Skip normal updates if currently in Angry Mode
    if (GameEngine && GameEngine.isAngryMode) return;

    // Map energy (0–100) to IQ display (10–180)
    const iq = Math.round(10 + (this.visualEnergy / 100) * 170);

    // Update live IQ number — title label stays fixed in HTML
    const iqValueEl = document.getElementById("ai-iq-value");
    if (iqValueEl) iqValueEl.innerText = `IQ: ${iq}`;

    // Tier badge colour (unchanged logic)
    if (this.visualEnergy < 40) {
      this.tierBadge.className = "ai-badge tier-learner";
    } else if (this.visualEnergy < 78) {
      this.tierBadge.className = "ai-badge tier-solver";
    } else {
      this.tierBadge.className = "ai-badge tier-master";
    }

    // Level title (replaces emoji — text only, no emoji)
    let levelTitle;
    if (iq <= 40) levelTitle = "Beginner";
    else if (iq <= 80) levelTitle = "Thinker";
    else if (iq <= 120) levelTitle = "Solver";
    else if (iq <= 150) levelTitle = "Strategist";
    else levelTitle = "Genius";
    this.emojiFace.innerText = levelTitle;

    // Brain glow state
    const brain = document.getElementById("iq-brain-svg");
    if (brain) {
      brain.classList.remove("iq-normal", "iq-bright", "iq-blue", "iq-gold", "iq-electric");
      if (iq <= 40) brain.classList.add("iq-normal");
      else if (iq <= 80) brain.classList.add("iq-bright");
      else if (iq <= 120) brain.classList.add("iq-blue");
      else if (iq <= 150) brain.classList.add("iq-gold");
      else brain.classList.add("iq-electric");
    }
  },

  triggerBrainPulse() {
    const brain = document.getElementById("iq-brain-svg");
    if (!brain) return;
    brain.classList.remove("iq-pulse", "iq-shake");
    void brain.offsetWidth;
    brain.classList.add("iq-pulse");
    setTimeout(() => brain.classList.remove("iq-pulse"), 220);
  },

  triggerBrainShake() {
    const brain = document.getElementById("iq-brain-svg");
    if (!brain) return;
    brain.classList.remove("iq-pulse", "iq-shake");
    void brain.offsetWidth;
    brain.classList.add("iq-shake");
    setTimeout(() => brain.classList.remove("iq-shake"), 220);
  }
};
