// ==========================================
// 9. GAME ENGINE (Issue 2 Implemented: Click + Drag Controller)
// ==========================================
const GameEngine = {
  grid: [],
  selectedCells: [],
  selectedStartCell: null,
  viewportEl: null,
  boardEl: null,
  connectorSvg: null,
  connectionLine: null,
  isDrawing: false,
  dragActive: false,
  dragStartPos: { x: 0, y: 0 },
  gameActive: true,
  tutorialCompleted: false,

  // Angry Mode Variables
  consecutiveMisses: 0,
  isAngryMode: false,

  init() {
    this.viewportEl = document.getElementById("gameplay-viewport");
    this.boardEl = document.getElementById("grid-board");
    this.connectorSvg = document.getElementById("connector-svg");
    this.connectionLine = document.getElementById("connection-line");

    // Build coordinates matching reference grid exactly
    const initial = SDK_CONFIG.board.initialGrid;
    for (let r = 0; r < SDK_CONFIG.board.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < SDK_CONFIG.board.columns; c++) {
        this.grid[r][c] = {
          value: initial[r] ? initial[r][c] : null,
          row: r,
          col: c
        };
      }
    }

    this.renderBoard();
    this.setupInputHandlers();
    // Flow is started externally by PlayableFlowEngine
  },

  renderBoard() {
    // Clear old cells
    const cellNodes = this.boardEl.querySelectorAll(".grid-cell");
    cellNodes.forEach(n => n.remove());

    for (let r = 0; r < SDK_CONFIG.board.rows; r++) {
      for (let c = 0; c < SDK_CONFIG.board.columns; c++) {
        const cellData = this.grid[r][c];
        const cellEl = document.createElement("button");
        cellEl.id = `cell-${r}-${c}`;
        cellEl.className = "grid-cell";
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        if (cellData.value === null) {
          cellEl.className = "grid-cell empty";
        } else {
          cellEl.innerText = cellData.value;
        }

        // Reapply selection visuals if cell matches the currently active click selection
        if (this.selectedStartCell && parseInt(this.selectedStartCell.dataset.row) === r && parseInt(this.selectedStartCell.dataset.col) === c) {
          cellEl.classList.add("selected");
        }

        this.boardEl.appendChild(cellEl);
      }
    }
  },

  getCellCenter(cellEl) {
    const boardRect = this.boardEl.getBoundingClientRect();
    const cellRect = cellEl.getBoundingClientRect();
    return {
      x: cellRect.left - boardRect.left + cellRect.width / 2,
      y: cellRect.top - boardRect.top + cellRect.height / 2
    };
  },

  setupInputHandlers() {
    const handleCellClick = (e) => {
      if (!this.gameActive) return;
      AudioEngine.init();

      const cellEl = e.target.closest(".grid-cell");
      if (!cellEl || cellEl.classList.contains("empty")) return;

      if (!AnalyticsEngine.firstInteraction) {
        AnalyticsEngine.firstInteraction = true;
        AnalyticsEngine.track("first_interaction");
        this.tutorialCompleted = true;
        TutorialEngine.stop();
      }

      if (!this.selectedStartCell) {
        // Select First Cell
        this.selectedStartCell = cellEl;
        cellEl.classList.add("selected");
        AudioEngine.playClick();
        AnalyticsEngine.track("cell_selected", { row: cellEl.dataset.row, col: cellEl.dataset.col });
      } else {
        // Tap Same Cell -> Deselect
        if (cellEl === this.selectedStartCell) {
          cellEl.classList.remove("selected");
          this.selectedStartCell = null;
          AudioEngine.playClick();
          AnalyticsEngine.track("cell_deselected");
        } else {
          // Tap Second Cell -> Match
          const rA = parseInt(this.selectedStartCell.dataset.row);
          const cA = parseInt(this.selectedStartCell.dataset.col);
          const rB = parseInt(cellEl.dataset.row);
          const cB = parseInt(cellEl.dataset.col);

          if (this.checkMatch(rA, cA, rB, cB)) {
            this.clearPair(rA, cA, rB, cB);
            this.selectedStartCell = null;
          } else {
            // Mismatch -> Clear selection 1, highlight selection 2
            ScoreEngine.registerMiss();
            AIAnalyzer.deductEnergy(15);
            this.triggerMismatchEffects(cellEl);
            GameFeelEngine.showWrongFeedback(cellEl);

            this.selectedStartCell.classList.remove("selected");
            this.selectedStartCell = cellEl;
            cellEl.classList.add("selected");
            AudioEngine.playClick();
          }
        }
      }
    };

    // Add click listener to board (event delegation)
    this.boardEl.addEventListener("click", handleCellClick);
  },

  valueAt(r, c) {
    return this.grid[r]?.[c]?.value ?? null;
  },

  compareCells(a, b) {
    return a.row === b.row ? a.col - b.col : a.row - b.row;
  },

  betweenLine(a, b, rowStep, colStep) {
    const cells = [];
    let r = a.row + rowStep;
    let c = a.col + colStep;
    while (r !== b.row || c !== b.col) {
      cells.push({ row: r, col: c });
      r += rowStep;
      c += colStep;
    }
    return cells;
  },

  wrapBetween(a, b) {
    const [start, end] = this.compareCells(a, b) <= 0 ? [a, b] : [b, a];
    if (end.row <= start.row) return null;
    const cells = [];
    const width = 9;
    for (let col = start.col + 1; col < width; col++) cells.push({ row: start.row, col });
    for (let row = start.row + 1; row < end.row; row++) {
      for (let col = 0; col < width; col++) cells.push({ row: row, col: col });
    }
    for (let col = 0; col < end.col; col++) cells.push({ row: end.row, col });
    return cells;
  },

  getPathCells(a, b) {
    if (a.row === b.row && a.col === b.col) return { pathType: "none", between: [] };
    if (a.row === b.row) return { pathType: "horizontal", between: this.betweenLine(a, b, 0, Math.sign(b.col - a.col)) };
    if (a.col === b.col) return { pathType: "vertical", between: this.betweenLine(a, b, Math.sign(b.row - a.row), 0) };
    if (Math.abs(a.row - b.row) === Math.abs(a.col - b.col)) {
      return { pathType: "diagonal", between: this.betweenLine(a, b, Math.sign(b.row - a.row), Math.sign(b.col - a.col)) };
    }
    const wrap = this.wrapBetween(a, b);
    return wrap ? { pathType: "wrap", between: wrap } : { pathType: "none", between: [] };
  },

  inspectPath(a, b) {
    const path = this.getPathCells(a, b);
    const blockers = path.between.filter((cell) => this.valueAt(cell.row, cell.col) !== null);
    return {
      pathType: path.pathType,
      blockers,
      result: path.pathType !== "none" && blockers.length === 0
    };
  },

  checkMatch(r1, c1, r2, c2) {
    const val1 = this.valueAt(r1, c1);
    const val2 = this.valueAt(r2, c2);

    if (val1 === null || val2 === null) return false;

    const isSum10 = (val1 + val2 === 10);
    const isSame = (val1 === val2);
    if (!isSum10 && !isSame) return false;

    const path = this.inspectPath({ row: r1, col: c1 }, { row: r2, col: c2 });
    return path.result;
  },

  clearPair(r1, c1, r2, c2) {
    const val1 = this.grid[r1][c1].value;
    const val2 = this.grid[r2][c2].value;

    // Calculate row clear bonuses BEFORE clearing
    const row1BeforeCount = this.grid[r1].filter(c => c.value !== null).length;
    const row2BeforeCount = this.grid[r2].filter(c => c.value !== null).length;

    // Clear cells
    this.grid[r1][c1].value = null;
    this.grid[r2][c2].value = null;

    const row1AfterCount = this.grid[r1].filter(c => c.value !== null).length;
    const row2AfterCount = this.grid[r2].filter(c => c.value !== null).length;

    let rowClearBonus = 0;
    if (row1BeforeCount > 0 && row1AfterCount === 0) rowClearBonus += 10;
    if (r1 !== r2 && row2BeforeCount > 0 && row2AfterCount === 0) rowClearBonus += 10;

    // Match base score
    let matchScore = 0;
    if (val1 === val2) {
      matchScore += 10;
    } else if (val1 + val2 === 10) {
      matchScore += 15;
    }

    // Path bonuses
    const path = this.inspectPath({ row: r1, col: c1 }, { row: r2, col: c2 });
    if (path.pathType === "diagonal") matchScore += 5;
    if (path.pathType === "wrap") matchScore += 5;

    // Add row clear bonus
    matchScore += rowClearBonus;

    // Audio
    AudioEngine.playCorrect();

    const elA = document.getElementById(`cell-${r1}-${c1}`);
    const elB = document.getElementById(`cell-${r2}-${c2}`);

    elA.classList.remove("selected");
    elB.classList.remove("selected");

    // Game Feel: cell pop on both matched cells
    GameFeelEngine.showCorrectFeedback(elA, elB);

    const rectA = elA.getBoundingClientRect();
    const rectB = elB.getBoundingClientRect();
    const appRect = document.getElementById("app-container").getBoundingClientRect();

    const centerX_A = rectA.left - appRect.left + rectA.width / 2;
    const centerY_A = rectA.top - appRect.top + rectA.height / 2;
    const centerX_B = rectB.left - appRect.left + rectB.width / 2;
    const centerY_B = rectB.top - appRect.top + rectB.height / 2;

    ParticleEngine.spawnSparkles(centerX_A, centerY_A, "#ffaa00");
    ParticleEngine.spawnSparkles(centerX_B, centerY_B, "#ffaa00");

    // Draw path line briefly
    this.connectionLine.setAttribute("x1", centerX_A);
    this.connectionLine.setAttribute("y1", centerY_A);
    this.connectionLine.setAttribute("x2", centerX_B);
    this.connectionLine.setAttribute("y2", centerY_B);
    this.connectionLine.style.display = "block";
    setTimeout(() => {
      this.connectionLine.style.display = "none";
    }, 250);

    this.spawnFloatingScore(`+${matchScore}`, (centerX_A + centerX_B) / 2, (centerY_A + centerY_B) / 2);
    this.spawnFloatingScore(`+50 XP`, (centerX_A + centerX_B) / 2 + 20, (centerY_A + centerY_B) / 2 - 15, true);

    EmotionEngine.spawnEmoji((rectA.left + rectB.left) / 2 - appRect.left + rectA.width / 2, (rectA.top + rectB.top) / 2 - appRect.top, "positive");

    ScoreEngine.addScore(matchScore);
    AIAnalyzer.addEnergy(10);

    // Redraw board to reflect empty cells
    this.renderBoard();

    // Notify flow engine that a pair was cleared
    PlayableFlowEngine.onPairCleared();
  },

  applyGravity() {
    // No-op: Gravity disabled to match original game mechanics
  },

  triggerAngryMode() {
    if (this.isAngryMode) return;
    this.isAngryMode = true;

    // Trigger crimson-black container overrides
    document.getElementById("app-container").classList.add("angry-mode");

    // Update AI badge/labels to critical warnings
    const tierBadge = document.getElementById("ai-badge-tier");
    const tierText = document.getElementById("ai-tier-text");
    const emojiFace = document.getElementById("ai-emoji-face");

    tierBadge.className = "ai-badge tier-learner"; // custom overrides applied by CSS
    tierBadge.style.background = "rgba(239, 68, 68, 0.15)";
    tierBadge.style.border = "1px solid #ff3333";
    tierText.innerText = "UNSTABLE STATE";
    tierText.style.color = "#ff3333";
    tierBadge.querySelector(".ai-dot").innerText = "🔴";
    emojiFace.innerText = "🤬";

    // Deep buzzer warning
    AudioEngine.playAngryWarning();

    // Spawn floating critical banner
    const boardRect = this.boardEl.getBoundingClientRect();
    this.spawnFloatingScore("😡 ANGRY MODE", boardRect.width / 2, boardRect.height / 2);

    AnalyticsEngine.track("angry_mode_entered");
  },

  clearAngryMode() {
    if (!this.isAngryMode) return;
    this.isAngryMode = false;
    this.consecutiveMisses = 0;

    // Revert class styles
    document.getElementById("app-container").classList.remove("angry-mode");

    // Clear style overrides
    const tierBadge = document.getElementById("ai-badge-tier");
    const tierText = document.getElementById("ai-tier-text");
    tierBadge.style.background = "";
    tierBadge.style.border = "";
    tierText.style.color = "";

    AIAnalyzer.updateVisuals();

    // Calm victory sound recovery
    AudioEngine.playVictory();

    // Spawn calm badge
    const boardRect = this.boardEl.getBoundingClientRect();
    this.spawnFloatingScore("😎 CALM DOWN!", boardRect.width / 2, boardRect.height / 2);

    AnalyticsEngine.track("angry_mode_exited");
  },

  triggerMismatchEffects(cellEl) {
    this.viewportEl.classList.add("red-flash");
    document.getElementById("app-container").classList.add("shake");
    setTimeout(() => {
      this.viewportEl.classList.remove("red-flash");
      document.getElementById("app-container").classList.remove("shake");
    }, 350);

    const rect = cellEl.getBoundingClientRect();
    const appRect = document.getElementById("app-container").getBoundingClientRect();

    const emojiType = this.isAngryMode ? "angry" : "negative";
    EmotionEngine.spawnEmoji(rect.left - appRect.left + rect.width / 2, rect.top - appRect.top, emojiType);
  },

  spawnFloatingScore(text, x, y, isXp = false) {
    const el = document.createElement("div");
    el.className = `floating-text ${isXp ? 'floating-xp' : ''}`;
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    document.getElementById("app-container").appendChild(el);
    setTimeout(() => el.remove(), 1000);
  },

  completeGame() {
    if (!this.gameActive) return;
    this.gameActive = false;
    TimerEngine.pause();

    // If in Angry Mode, clear it before outro to display correct styling
    this.clearAngryMode();

    AudioEngine.playVictory();
    CTAEngine.showOutro(true);
  }
};
