// ==========================================
// 3. AUDIO ENGINE (Synthesized Audio Synth)
// ==========================================
const AudioEngine = {
  ctx: null,
  muted: false,

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    this.resume();
    const icon = document.getElementById("speaker-icon");
    const waves = icon.querySelectorAll(".sound-wave");
    if (this.muted) {
      waves.forEach(w => w.style.display = "none");
      AnalyticsEngine.track("audio_muted");
    } else {
      waves.forEach(w => w.style.display = "block");
      AnalyticsEngine.track("audio_unmuted");
    }
  },

  playTone(freq, type, duration, delay = 0) {
    if (this.muted || !this.ctx) return;
    this.resume();

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio execution safe catch
      }
    }, delay * 1000);
  },

  playCorrect() {
    this.playTone(523.25, "sine", 0.18, 0); // C5
    this.playTone(659.25, "sine", 0.18, 0.08); // E5
    this.playTone(783.99, "sine", 0.35, 0.16); // G5
  },

  playWrong() {
    if (this.muted || !this.ctx) return;
    this.resume();
    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.35);

      gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) { }
  },

  playAngryWarning() {
    if (this.muted || !this.ctx) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.type = "sawtooth";
      osc2.type = "sawtooth";

      osc1.frequency.setValueAtTime(100, now);
      osc1.frequency.linearRampToValueAtTime(160, now + 0.3);
      osc1.frequency.linearRampToValueAtTime(100, now + 0.6);

      osc2.frequency.setValueAtTime(104, now);
      osc2.frequency.linearRampToValueAtTime(164, now + 0.3);
      osc2.frequency.linearRampToValueAtTime(104, now + 0.6);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch (e) { }
  },

  playCombo(streak) {
    const pitchMultiplier = 1 + (streak * 0.1);
    this.playTone(440 * pitchMultiplier, "sine", 0.15, 0);
    this.playTone(554.37 * pitchMultiplier, "sine", 0.15, 0.05);
    this.playTone(659.25 * pitchMultiplier, "sine", 0.3, 0.10);
  },

  playClick() {
    this.playTone(600, "sine", 0.08, 0);
  },

  playVictory() {
    const notes = [523, 659, 783, 1046];
    notes.forEach((freq, idx) => {
      this.playTone(freq, "sine", 0.35, idx * 0.08);
    });
  }
};
