// ==========================================
// 10. CTA ENGINE (Issue 3: Play Store Redirect Config)
// ==========================================
const CTAEngine = {
  overlay: null,

  init() {
    this.overlay = document.getElementById("cta-overlay");

    document.getElementById("install-btn").addEventListener("click", () => this.triggerRedirect());
    document.getElementById("continue-btn").addEventListener("click", () => this.triggerRedirect());
  },

  showOutro(won = false) {
    TimerEngine.pause();
    GameEngine.gameActive = false;

    const finalScore = ScoreEngine.score;
    const accuracy = ScoreEngine.getAccuracyPercent();
    const maxStreak = ScoreEngine.maxStreak;
    const xpEarned = finalScore * 10;

    document.getElementById("stat-final-score").innerText = finalScore;
    document.getElementById("stat-accuracy").innerText = accuracy;
    document.getElementById("stat-max-combo").innerText = `x${maxStreak}`;
    document.getElementById("stat-xp").innerText = `${xpEarned} XP`;

    const currentTier = document.getElementById("ai-tier-text").innerText;
    document.getElementById("outro-tier-label").innerText = currentTier;

    this.overlay.classList.add("active");
    ParticleEngine.spawnConfetti();

    AnalyticsEngine.track("cta_viewed", {
      score: finalScore,
      accuracy,
      maxStreak,
      skillTier: currentTier
    });
  },

  triggerRedirect() {
    AnalyticsEngine.track("cta_clicked");
    const url = SDK_CONFIG.redirectURL || "https://play.google.com/store/apps/details?id=com.ezygamers.sumlinknumbergame&hl=en_IN";
    console.log(`Redirecting to: ${url}`);

    if (typeof mraid !== "undefined" && mraid.open) {
      mraid.open(url);
    } else {
      window.open(url, "_blank");
    }
  }
};
