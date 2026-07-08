// ==========================================
// 10.5 TUTORIAL ENGINE (Dynamic Tap Animation)
// ==========================================
const TutorialEngine = {
  intervalId: null,
  active: false,

  start() {
    if (GameEngine.tutorialCompleted) return;
    this.active = true;
    const hand = document.getElementById("tutorial-indicator");
    if (!hand) return;
    hand.style.opacity = "0";
    hand.style.display = "block";

    let step = 0;
    const runStep = () => {
      if (!this.active || GameEngine.tutorialCompleted) {
        this.stop();
        return;
      }

      const cellA = document.getElementById("cell-0-6");
      const cellB = document.getElementById("cell-0-7");

      if (!cellA || !cellB) return;

      // Get centers relative to the app container
      const rectA = cellA.getBoundingClientRect();
      const rectB = cellB.getBoundingClientRect();
      const appRect = document.getElementById("app-container").getBoundingClientRect();

      const xA = rectA.left - appRect.left + rectA.width / 2;
      const yA = rectA.top - appRect.top + rectA.height / 2;
      const xB = rectB.left - appRect.left + rectB.width / 2;
      const yB = rectB.top - appRect.top + rectB.height / 2;

      if (step === 0) {
        // Position at cell A and fade in
        hand.style.left = `${xA}px`;
        hand.style.top = `${yA}px`;
        hand.style.transform = "translate(-50%, -50%) scale(1.1)";
        hand.style.opacity = "1";

        // Clear selections visually
        cellA.classList.remove("selected");
        cellB.classList.remove("selected");

        setTimeout(() => { step = 1; runStep(); }, 500);
      } else if (step === 1) {
        // Tap cell A (scale down)
        hand.style.transform = "translate(-50%, -50%) scale(0.9)";
        cellA.classList.add("selected");

        setTimeout(() => { step = 2; runStep(); }, 400);
      } else if (step === 2) {
        // Move to cell B (keep scale 1.1)
        hand.style.left = `${xB}px`;
        hand.style.top = `${yB}px`;
        hand.style.transform = "translate(-50%, -50%) scale(1.1)";

        setTimeout(() => { step = 3; runStep(); }, 600);
      } else if (step === 3) {
        // Tap cell B (scale down)
        hand.style.transform = "translate(-50%, -50%) scale(0.9)";
        cellB.classList.add("selected");

        setTimeout(() => { step = 4; runStep(); }, 400);
      } else if (step === 4) {
        // Clear selection highlight and restart
        hand.style.opacity = "0";
        setTimeout(() => {
          cellA.classList.remove("selected");
          cellB.classList.remove("selected");
          step = 0;
          // Loop again after brief delay
          setTimeout(() => runStep(), 800);
        }, 500);
      }
    };

    runStep();
  },

  stop() {
    this.active = false;
    const hand = document.getElementById("tutorial-indicator");
    if (hand) {
      hand.style.display = "none";
      hand.style.opacity = "0";
    }
    const cellA = document.getElementById("cell-0-6");
    const cellB = document.getElementById("cell-0-7");
    if (cellA) cellA.classList.remove("selected");
    if (cellB) cellB.classList.remove("selected");
  }
};
