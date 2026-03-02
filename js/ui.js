/**
 * ui.js
 * PetUI class — handles ALL DOM updates.
 *
 * Responsibilities:
 *  - Render the animated SVG pet character
 *  - Update stat bars (hunger, happiness, energy, health)
 *  - Show mood expression changes on the pet
 *  - Display toast notification messages
 *  - Update the info panel (name, level, age, state)
 *  - Apply day/night background changes
 */

class PetUI {
  constructor() {
    // Cache DOM references
    this.petStage       = document.getElementById("pet-stage");
    this.petEmoji       = document.getElementById("pet-emoji");
    this.petMood        = document.getElementById("pet-mood");
    this.petName        = document.getElementById("pet-name-display");
    this.petLevel       = document.getElementById("pet-level");
    this.petAge         = document.getElementById("pet-age");
    this.petStateLabel  = document.getElementById("pet-state-label");

    // Stat bars
    this.bars = {
      hunger:    { fill: document.getElementById("hunger-fill"),    val: document.getElementById("hunger-val") },
      happiness: { fill: document.getElementById("happiness-fill"), val: document.getElementById("happiness-val") },
      energy:    { fill: document.getElementById("energy-fill"),    val: document.getElementById("energy-val") },
      health:    { fill: document.getElementById("health-fill"),    val: document.getElementById("health-val") }
    };

    this.toastQueue = [];
    this.toastTimer = null;
  }

  // ══════════════════════════════════════════════════════════
  //  FULL RENDER
  // ══════════════════════════════════════════════════════════

  /**
   * Full update pass — call after every tick or interaction
   * @param {Pet} pet
   */
  render(pet) {
    this._updatePetVisual(pet);
    this._updateStats(pet);
    this._updateInfo(pet);
  }

  // ══════════════════════════════════════════════════════════
  //  PET VISUAL
  // ══════════════════════════════════════════════════════════

  _updatePetVisual(pet) {
    // Update emoji
    if (this.petEmoji) {
      this.petEmoji.textContent = pet.typeData.emoji;
    }

    // Update mood expression
    const moodMap = {
      happy:    { face: "^‿^", anim: "bounce",  color: "#ffe082" },
      neutral:  { face: "•‿•", anim: "idle",    color: "#e0f0e0" },
      hungry:   { face: ">﹏<", anim: "shake",   color: "#ffcccc" },
      tired:    { face: "-‿-", anim: "droop",   color: "#d0d8ff" },
      sad:      { face: "T‿T", anim: "sad",     color: "#cce0ff" },
      sleeping: { face: "–‿–", anim: "sleep",   color: "#e8d8ff" },
      sick:     { face: "x‿x", anim: "sick",    color: "#d8f0d8" },
      dead:     { face: "x_x", anim: "dead",    color: "#cccccc" }
    };

    const mood = moodMap[pet.state] || moodMap.neutral;

    if (this.petMood) {
      this.petMood.textContent = mood.face;
    }

    // Apply animation class to pet stage
    if (this.petStage) {
      // Remove all mood classes
      this.petStage.className = "pet-stage";
      this.petStage.classList.add(`anim-${mood.anim}`);
      this.petStage.style.setProperty("--pet-glow", mood.color);
    }

    // Critical state warning pulse
    const isCritical = pet.hunger > 80 || pet.happiness < 20 || pet.energy < 15 || pet.health < 30;
    if (this.petStage) {
      this.petStage.classList.toggle("critical-pulse", isCritical && pet.isAlive);
    }

    // Dead overlay
    const deadOverlay = document.getElementById("dead-overlay");
    if (deadOverlay) {
      deadOverlay.style.display = pet.state === "dead" ? "flex" : "none";
    }
  }

  // ══════════════════════════════════════════════════════════
  //  STAT BARS
  // ══════════════════════════════════════════════════════════

  _updateStats(pet) {
    // Hunger: displayed as "fullness" (inverted, 100 = full, 0 = starving)
    const fullness = 100 - pet.hunger;
    this._setBar("hunger", fullness);
    this._setBar("happiness", pet.happiness);
    this._setBar("energy", pet.energy);
    this._setBar("health", pet.health);
  }

  _setBar(stat, value) {
    const bar = this.bars[stat];
    if (!bar) return;
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    bar.fill.style.width = pct + "%";
    bar.val.textContent  = pct + "%";

    // Color coding: green > yellow > red
    let color;
    if (pct > 60)      color = "var(--stat-good)";
    else if (pct > 30) color = "var(--stat-warn)";
    else               color = "var(--stat-bad)";
    bar.fill.style.background = color;

    // Flash bar on critical
    bar.fill.classList.toggle("bar-critical", pct < 20);
  }

  // ══════════════════════════════════════════════════════════
  //  INFO PANEL
  // ══════════════════════════════════════════════════════════

  _updateInfo(pet) {
    if (this.petName)  this.petName.textContent  = pet.name;
    if (this.petLevel) this.petLevel.textContent = `Lv. ${pet.level}`;

    const days = Math.floor(pet.age / (12 * 24)); // Ticks → game days
    if (this.petAge)  this.petAge.textContent  = `Day ${days}`;

    // State label with emoji
    const stateLabels = {
      happy: "😊 Happy", neutral: "😐 Okay", hungry: "🍽️ Hungry",
      tired: "😪 Tired", sad: "😢 Sad", sleeping: "💤 Sleeping",
      sick: "🤒 Sick", dead: "💔 Gone"
    };
    if (this.petStateLabel) {
      this.petStateLabel.textContent = stateLabels[pet.state] || pet.state;
    }
  }

  // ══════════════════════════════════════════════════════════
  //  TOAST MESSAGES
  // ══════════════════════════════════════════════════════════

  /**
   * Show a toast notification
   * @param {string} message
   * @param {string} type - 'info' | 'success' | 'warning' | 'error'
   */
  showToast(message, type = "info") {
    this.toastQueue.push({ message, type });
    if (!this.toastTimer) this._processToastQueue();
  }

  _processToastQueue() {
    if (this.toastQueue.length === 0) {
      this.toastTimer = null;
      return;
    }
    const { message, type } = this.toastQueue.shift();
    this._displayToast(message, type);
    this.toastTimer = setTimeout(() => this._processToastQueue(), 2500);
  }

  _displayToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute("role", "alert");

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add("toast-show"));

    // Remove after 2s
    setTimeout(() => {
      toast.classList.remove("toast-show");
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  // ══════════════════════════════════════════════════════════
  //  DAY / NIGHT CYCLE
  // ══════════════════════════════════════════════════════════

  /**
   * Update background based on time of day
   * @param {string} period - 'dawn' | 'day' | 'dusk' | 'night'
   */
  setTimeOfDay(period) {
    const bg = document.getElementById("app-bg");
    if (!bg) return;
    bg.className = "app-bg";
    bg.classList.add(`time-${period}`);

    const label = document.getElementById("time-label");
    const labels = { dawn: "🌅 Dawn", day: "☀️ Day", dusk: "🌇 Dusk", night: "🌙 Night" };
    if (label) label.textContent = labels[period] || "";
  }

  // ══════════════════════════════════════════════════════════
  //  ACHIEVEMENT POPUP
  // ══════════════════════════════════════════════════════════

  showAchievement(title, icon) {
    this.showToast(`${icon} Achievement Unlocked: ${title}!`, "success");

    // Update achievements panel
    const list = document.getElementById("achievements-list");
    if (!list) return;
    const item = document.createElement("div");
    item.className = "achievement-item";
    item.innerHTML = `<span class="ach-icon">${icon}</span><span class="ach-title">${title}</span>`;
    list.appendChild(item);
  }

  // ══════════════════════════════════════════════════════════
  //  PET SELECTION SCREEN
  // ══════════════════════════════════════════════════════════

  showSelectScreen() {
    document.getElementById("select-screen").style.display = "flex";
    document.getElementById("game-screen").style.display  = "none";
  }

  showGameScreen() {
    document.getElementById("select-screen").style.display = "none";
    document.getElementById("game-screen").style.display  = "flex";
  }

  // Button feedback
  flashButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.add("btn-flash");
    setTimeout(() => btn.classList.remove("btn-flash"), 300);
  }
}
