// ==========================================
// 6. SCORE & TIMER ENGINE
// ==========================================
const ScoreEngine = {
  score: 0,
  visualScore: 0,
  targetScore: 100,
  accuracy: { correct: 0, total: 0 },
  streak: 0,
  maxStreak: 0,
  scoreLabel: null,
  scoreBox: null,

  init() {
    this.scoreLabel = document.getElementById("score-label");
    this.scoreBox = document.getElementById("score-box");
    this.targetScore = SDK_CONFIG.targetScore;
  },

  addScore(amount) {
    this.score += amount;
    this.accuracy.correct++;
    this.accuracy.total++;
    this.streak++;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
    }

    // Recover from Angry Mode if active
    if (GameEngine.isAngryMode) {
      GameEngine.clearAngryMode();
    } else {
      GameEngine.consecutiveMisses = 0;
    }

    this.animateScore();
    this.triggerPulse();

    if (this.streak >= 2) {
      ComboSystem.show(this.streak);
      GameFeelEngine.showComboFeedback(this.streak);
    }

    AnalyticsEngine.track("correct_match", {
      score: this.score,
      streak: this.streak,
      accuracy: this.getAccuracyPercent()
    });

    if (this.score >= this.targetScore) {
      setTimeout(() => GameEngine.completeGame(), 600);
    }
  },

  registerMiss() {
    this.accuracy.total++;
    this.streak = 0;

    // Track consecutive misses for Angry Mode
    GameEngine.consecutiveMisses++;

    if (GameEngine.consecutiveMisses >= 3) {
      GameEngine.triggerAngryMode();
    } else {
      AudioEngine.playWrong();
    }

    AnalyticsEngine.track("wrong_match", {
      accuracy: this.getAccuracyPercent(),
      consecutiveMisses: GameEngine.consecutiveMisses
    });
  },

  getAccuracyPercent() {
    if (this.accuracy.total === 0) return "100%";
    return `${Math.round((this.accuracy.correct / this.accuracy.total) * 100)}%`;
  },

  animateScore() {
    const step = () => {
      if (this.visualScore < this.score) {
        this.visualScore += Math.ceil((this.score - this.visualScore) * 0.15);
        if (this.visualScore > this.score) this.visualScore = this.score;
        this.scoreLabel.innerText = this.visualScore;
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  },

  triggerPulse() {
    this.scoreBox.classList.add("pulse");
    setTimeout(() => this.scoreBox.classList.remove("pulse"), 250);
  }
};

const TimerEngine = {
  startTime: 0,
  duration: 20000,
  timerId: null,
  paused: false,

  start(callback) {
    this.startTime = Date.now();
    this.duration = SDK_CONFIG.ctaLimitSeconds * 1000;

    this.timerId = setTimeout(() => {
      if (!this.paused) {
        callback();
      }
    }, this.duration);
  },

  pause() {
    this.paused = true;
    clearTimeout(this.timerId);
  }
};
