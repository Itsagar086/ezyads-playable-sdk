// ==========================================
// 4. PARTICLE ENGINE (HTML5 Canvas Particles)
// ==========================================
const ParticleEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animationFrameId: null,

  init() {
    this.canvas = document.getElementById("particles-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.loop();
  },

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  },

  spawn(x, y, color, count, type = "sparkle") {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = type === "smoke" ? Math.random() * 0.8 + 0.4 : Math.random() * 3 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (type === "sparkle" ? -0.5 : -0.1),
        color,
        radius: type === "confetti" ? Math.random() * 4 + 2.5 : Math.random() * 2 + 1,
        alpha: 1,
        decay: type === "smoke" ? 0.015 : Math.random() * 0.02 + 0.015,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08
      });
    }
  },

  spawnSparkles(x, y, color = "#ffaa00") {
    this.spawn(x, y, color, 12, "sparkle");
  },

  spawnSmoke(x, y) {
    this.spawn(x, y, "rgba(180,180,180,0.4)", 6, "smoke");
  },

  spawnConfetti() {
    const colors = ["#ffaa00", "#3b82f6", "#10b981", "#ef4444", "#a855f7"];
    const containerWidth = this.canvas.width;
    for (let i = 0; i < 30; i++) {
      const startX = Math.random() * containerWidth;
      this.particles.push({
        x: startX,
        y: -10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 5 + 3,
        alpha: 1,
        decay: Math.random() * 0.008 + 0.004,
        type: "confetti",
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.06
      });
    }
  },

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      if (p.type === "confetti") {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.radius, -p.radius / 2, p.radius * 2, p.radius);
      } else if (p.type === "smoke") {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * (2.2 - p.alpha), 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  },

  loop() {
    this.update();
    this.draw();

    // Spawn red sparks periodically from bottom of board in Angry Mode
    if (GameEngine && GameEngine.isAngryMode && Math.random() < 0.22) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const startX = Math.random() * w;
      const startY = h - 60;
      this.spawn(startX, startY, "rgba(255, 51, 51, 0.8)", 1, "sparkle");
    }

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }
};
