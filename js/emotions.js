// ==========================================
// 5. EMOTION ENGINE
// ==========================================
const EmotionEngine = {
  layer: null,
  positiveEmojis: ["😀", "😎", "🤩", "🔥", "👑", "👍", "🎉"],
  negativeEmojis: ["😕", "😢", "😭", "🤯", "👎", "❌"],
  angryEmojis: ["😡", "🤬", "🔥", "👿", "💥"],

  init() {
    this.layer = document.getElementById("emotion-layer");
  },

  spawnEmoji(x, y, type = "positive") {
    let list;
    if (type === "positive") {
      list = this.positiveEmojis;
    } else if (type === "angry") {
      list = this.angryEmojis;
    } else {
      list = this.negativeEmojis;
    }

    const emoji = list[Math.floor(Math.random() * list.length)];

    const el = document.createElement("div");
    el.className = "emotion-emoji";
    el.innerText = emoji;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    this.layer.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
};
