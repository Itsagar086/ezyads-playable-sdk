// ==========================================
// 11. PLAYABLE FLOW ENGINE
// ==========================================
//
// Phase 1:  0 –  8 s  →  Auto-play tutorial (3-5 real matches)
// Phase 2:  8 – 23 s  →  Player interaction (hand guides first move)
// Phase 3: 23 – 28 s  →  CTA overlay
//
const PlayableFlowEngine = {
  phase: "idle",           // idle | autoplay | player | cta
  autoPlayTimer: null,
  ctaTimer: null,
  playerFirstMoveDone: false,

  // Pre-verified valid pairs from the initial board (row, col pairs).
  // Each entry is [r1, c1, r2, c2] – all are adjacent same-value cells with no blockers.
  autoPlayMoves: [
    [0, 6, 0, 7],   // row 0: 1+1 same-value, adjacent (cols 6-7)
    [1, 0, 2, 0],   // col 0: 1+1 same-value, adjacent (rows 1-2)
    [0, 8, 1, 8],   // col 8: 2+2 same-value, adjacent (rows 0-1)
    [2, 1, 3, 1],   // col 1: 1+1 same-value, adjacent (rows 2-3)
    [1, 1, 1, 2],   // row 1: 2+2 same-value, adjacent (cols 1-2)
  ],

  // Index into autoPlayMoves currently executing
  autoPlayIndex: 0,

  start() {
    this.phase = "autoplay";
    this.autoPlayIndex = 0;
    this.playerFirstMoveDone = false;

    // Disable player clicks during autoplay
    GameEngine.gameActive = false;

    // Start executing auto moves after a short initial delay
    this.scheduleNextAutoMove(800);

    // At t=8s switch to player phase
    this.autoPlayTimer = setTimeout(() => this.startPlayerPhase(), 8000);

    // At t=28s show CTA
    this.ctaTimer = setTimeout(() => this.startCTAPhase(), 28000);
  },

  scheduleNextAutoMove(delay) {
    if (this.phase !== "autoplay") return;

    // Find the next move that is still valid on the current board
    while (this.autoPlayIndex < this.autoPlayMoves.length) {
      const [r1, c1, r2, c2] = this.autoPlayMoves[this.autoPlayIndex];
      if (GameEngine.checkMatch(r1, c1, r2, c2)) break;
      this.autoPlayIndex++; // skip invalid (already cleared or blocked)
    }

    if (this.autoPlayIndex >= this.autoPlayMoves.length) return; // no more scripted moves

    setTimeout(() => this.executeAutoMove(), delay);
  },

  executeAutoMove() {
    if (this.phase !== "autoplay") return;

    const [r1, c1, r2, c2] = this.autoPlayMoves[this.autoPlayIndex];
    this.autoPlayIndex++;

    // Validate again in case board changed
    if (!GameEngine.checkMatch(r1, c1, r2, c2)) {
      this.scheduleNextAutoMove(300);
      return;
    }

    const cellA = document.getElementById(`cell-${r1}-${c1}`);
    const cellB = document.getElementById(`cell-${r2}-${c2}`);
    if (!cellA || !cellB) return;

    // Show hand moving from cellA to cellB
    const hand = document.getElementById("tutorial-indicator");
    const appRect = document.getElementById("app-container").getBoundingClientRect();
    const rectA = cellA.getBoundingClientRect();
    const rectB = cellB.getBoundingClientRect();
    const xA = rectA.left - appRect.left + rectA.width / 2;
    const yA = rectA.top - appRect.top + rectA.height / 2;
    const xB = rectB.left - appRect.left + rectB.width / 2;
    const yB = rectB.top - appRect.top + rectB.height / 2;

    if (hand) {
      hand.style.display = "block";
      hand.style.left = `${xA}px`;
      hand.style.top = `${yA}px`;
      hand.style.transform = "translate(-50%, -50%) scale(1.1)";
      hand.style.opacity = "1";
    }

    // Step 1: highlight first cell (400 ms)
    setTimeout(() => {
      if (this.phase !== "autoplay") return;
      cellA.classList.add("selected");
      if (hand) hand.style.transform = "translate(-50%, -50%) scale(0.9)";
      AudioEngine.playClick();

      // Step 2: move hand to second cell (600 ms)
      setTimeout(() => {
        if (this.phase !== "autoplay") return;
        cellA.classList.remove("selected");
        if (hand) {
          hand.style.left = `${xB}px`;
          hand.style.top = `${yB}px`;
          hand.style.transform = "translate(-50%, -50%) scale(1.1)";
        }

        // Step 3: tap second cell and execute match (400 ms)
        setTimeout(() => {
          if (this.phase !== "autoplay") return;
          if (hand) hand.style.transform = "translate(-50%, -50%) scale(0.9)";
          cellB.classList.add("selected");
          AudioEngine.playClick();

          // Execute the actual match via game engine
          setTimeout(() => {
            if (this.phase !== "autoplay") return;
            cellB.classList.remove("selected");
            // gameActive must be true briefly to allow clearPair
            GameEngine.gameActive = true;
            GameEngine.clearPair(r1, c1, r2, c2);
            GameEngine.gameActive = false;
            GameEngine.selectedStartCell = null;
          }, 300);

        }, 400);
      }, 600);
    }, 400);
  },

  // Called by GameEngine.clearPair() after every successful match
  onPairCleared() {
    if (this.phase === "autoplay") {
      // Schedule next auto-play move (gap between moves ~1.8 s total)
      this.scheduleNextAutoMove(800);
    } else if (this.phase === "player" && !this.playerFirstMoveDone) {
      // Player completed their first guided move — remove hand permanently
      this.playerFirstMoveDone = true;
      TutorialEngine.stop();
    }
  },

  startPlayerPhase() {
    if (this.phase === "cta") return;
    this.phase = "player";

    // Stop any remaining auto-play hand animation
    TutorialEngine.stop();

    // Re-enable player input
    GameEngine.gameActive = true;
    GameEngine.tutorialCompleted = false; // allow TutorialEngine hand below

    // Guide first player move — reuse existing TutorialEngine hand animation
    // pointing at cells that still exist on the current board.
    // Find a valid pair to highlight for the player.
    const guideMove = this.findGuideMove();
    if (guideMove) {
      // Start the visual hint loop using TutorialEngine's existing mechanism
      // but override the target cells to the guideMove
      this.startGuidedHint(guideMove[0], guideMove[1], guideMove[2], guideMove[3]);
    }
  },

  // Find the first valid move on the current board for the player hint
  findGuideMove() {
    const rows = SDK_CONFIG.board.rows;
    const cols = SDK_CONFIG.board.columns;
    for (let r1 = 0; r1 < rows; r1++) {
      for (let c1 = 0; c1 < cols; c1++) {
        if (GameEngine.valueAt(r1, c1) === null) continue;
        for (let r2 = 0; r2 < rows; r2++) {
          for (let c2 = 0; c2 < cols; c2++) {
            if (r1 === r2 && c1 === c2) continue;
            if (GameEngine.valueAt(r2, c2) === null) continue;
            if (GameEngine.checkMatch(r1, c1, r2, c2)) return [r1, c1, r2, c2];
          }
        }
      }
    }
    return null;
  },

  // Show the hand bouncing between two cells to guide the player's first move
  startGuidedHint(r1, c1, r2, c2) {
    if (this.playerFirstMoveDone) return;

    const hand = document.getElementById("tutorial-indicator");
    const appRect = document.getElementById("app-container").getBoundingClientRect();

    const runHint = () => {
      if (this.phase !== "player" || this.playerFirstMoveDone) {
        TutorialEngine.stop();
        return;
      }

      const cellA = document.getElementById(`cell-${r1}-${c1}`);
      const cellB = document.getElementById(`cell-${r2}-${c2}`);
      if (!cellA || !cellB || cellA.classList.contains("empty") || cellB.classList.contains("empty")) {
        // Cells were already matched; stop hinting
        TutorialEngine.stop();
        return;
      }

      const rectA = cellA.getBoundingClientRect();
      const rectB = cellB.getBoundingClientRect();
      const xA = rectA.left - appRect.left + rectA.width / 2;
      const yA = rectA.top - appRect.top + rectA.height / 2;
      const xB = rectB.left - appRect.left + rectB.width / 2;
      const yB = rectB.top - appRect.top + rectB.height / 2;

      if (hand) {
        hand.style.display = "block";
        hand.style.left = `${xA}px`;
        hand.style.top = `${yA}px`;
        hand.style.transform = "translate(-50%, -50%) scale(1.1)";
        hand.style.opacity = "1";
      }

      setTimeout(() => {
        if (this.phase !== "player" || this.playerFirstMoveDone) return;
        if (hand) hand.style.transform = "translate(-50%, -50%) scale(0.9)";
        cellA.classList.add("selected");

        setTimeout(() => {
          if (this.phase !== "player" || this.playerFirstMoveDone) return;
          cellA.classList.remove("selected");
          if (hand) {
            hand.style.left = `${xB}px`;
            hand.style.top = `${yB}px`;
            hand.style.transform = "translate(-50%, -50%) scale(1.1)";
          }

          setTimeout(() => {
            if (this.phase !== "player" || this.playerFirstMoveDone) return;
            if (hand) hand.style.transform = "translate(-50%, -50%) scale(0.9)";
            cellB.classList.add("selected");

            setTimeout(() => {
              if (this.phase !== "player" || this.playerFirstMoveDone) return;
              cellA.classList.remove("selected");
              cellB.classList.remove("selected");
              if (hand) hand.style.opacity = "0";

              // Loop hint after a pause
              setTimeout(() => runHint(), 900);
            }, 400);
          }, 400);
        }, 600);
      }, 500);
    };

    runHint();
  },

  startCTAPhase() {
    if (this.phase === "cta") return;
    this.phase = "cta";

    TutorialEngine.stop();
    GameEngine.completeGame();
  }
};
