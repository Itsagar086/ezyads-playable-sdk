// ==========================================
// 2. ANALYTICS ENGINE
// ==========================================
const AnalyticsEngine = {
  startTime: 0,
  firstInteraction: false,

  init() {
    this.startTime = Date.now();
    this.track("game_started");
  },

  track(eventName, data = {}) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const payload = {
      event: eventName,
      timeSinceStart: `${elapsed}s`,
      ...data
    };
    console.log(`%c[Analytics] ${eventName.toUpperCase()}`, "color: #10b981; font-weight: bold;", payload);
  }
};
