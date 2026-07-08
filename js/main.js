// ==========================================
// 13. BOOTSTRAP INITIALIZATION (main.js)
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  AnalyticsEngine.init();
  AudioEngine.init();
  ParticleEngine.init();
  EmotionEngine.init();
  ScoreEngine.init();
  ComboSystem.init();
  AIAnalyzer.init();
  GameEngine.init();
  CTAEngine.init();
  GameFeelEngine.init();

  document.getElementById("mute-btn").addEventListener("click", () => {
    AudioEngine.toggleMute();
  });

  // Launch 3-phase playable ad flow
  PlayableFlowEngine.start();
});
