/**
 * game.js
 * GameController — orchestrates everything:
 *  - Game loop (5s tick)
 *  - User interaction handlers (Feed, Play, Sleep, Wake)
 *  - Day/Night cycle (real-time hour based)
 *  - Achievement system
 *  - Save/Load via sessionStorage
 *  - Pet selection / new game
 */

class GameController {
  constructor() {
    this.pet         = null;
    this.ui          = new PetUI();
    this.tickInterval = null;
    this.tickCount    = 0;

    // Achievement tracking
    this.achievements = new Set();
    this.ACHIEVEMENTS = {
      first_feed:    { title: "First Meal",       icon: "🍽️",  trigger: "feed",   count: 1  },
      first_play:    { title: "Playtime!",         icon: "🎾",  trigger: "play",   count: 1  },
      well_fed:      { title: "Well Fed",          icon: "😋",  trigger: "feed",   count: 10 },
      playful:       { title: "Playful Friend",    icon: "🎈",  trigger: "play",   count: 10 },
      survivor:      { title: "Survivor",          icon: "💪",  trigger: "tick",   count: 100 },
      senior:        { title: "Senior Pet",        icon: "👴",  trigger: "tick",   count: 500 },
      max_happy:     { title: "Pure Joy",          icon: "✨",  trigger: "happy",  count: 1  },
      good_health:   { title: "In Good Health",    icon: "💚",  trigger: "health", count: 1  },
    };
    this.interactionCounts = { feed: 0, play: 0 };

    this._bindUI();
    this._loadGame();
  }

  // ══════════════════════════════════════════════════════════
  //  GAME START / SELECT
  // ══════════════════════════════════════════════════════════

  _bindUI() {
    // Pet type selection cards
    document.querySelectorAll(".pet-select-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".pet-select-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this._selectedType = card.dataset.type;

        // Update selection preview
        const td = PET_TYPES[this._selectedType];
        const preview = document.getElementById("selected-preview");
        if (preview) {
          preview.textContent = td.emoji;
          preview.style.filter = `drop-shadow(0 0 12px ${td.bodyColor})`;
        }
        const personalityEl = document.getElementById("selected-personality");
        if (personalityEl) personalityEl.textContent = td.personality;
      });
    });

    // Start game button
    document.getElementById("btn-start-game")?.addEventListener("click", () => {
      const nameInput = document.getElementById("pet-name-input");
      const name = nameInput?.value.trim() || "Mochi";
      const type = this._selectedType || "cat";
      this._startNewGame(type, name);
    });

    // Interaction buttons
    document.getElementById("btn-feed") ?.addEventListener("click", () => this._feed());
    document.getElementById("btn-play") ?.addEventListener("click", () => this._play());
    document.getElementById("btn-sleep")?.addEventListener("click", () => this._sleep());

    // New game button (from game screen)
    document.getElementById("btn-new-pet")?.addEventListener("click", () => {
      this._stopLoop();
      this._saveGame();
      this.ui.showSelectScreen();
    });

    // Revive button (shown when pet dies)
    document.getElementById("btn-revive")?.addEventListener("click", () => {
      this.ui.showSelectScreen();
    });
  }

  _startNewGame(type, name) {
    this.pet = new Pet(type, name);
    this.achievements = new Set();
    this.interactionCounts = { feed: 0, play: 0 };
    this._saveGame();
    this.ui.showGameScreen();
    this.ui.render(this.pet);
    this.ui.showToast(`🌟 Welcome, ${name}! Take good care of me!`, "success");
    this._startLoop();
    this._updateDayNight();
  }

  // ══════════════════════════════════════════════════════════
  //  GAME LOOP
  // ══════════════════════════════════════════════════════════

  _startLoop() {
    this._stopLoop();
    this.tickInterval = setInterval(() => this._tick(), 5000); // Every 5 seconds
  }

  _stopLoop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  _tick() {
    if (!this.pet) return;

    const alert = this.pet.tick();
    this.tickCount++;

    // Update UI
    this.ui.render(this.pet);
    this._updateDayNight();
    this._saveGame();

    // Show tick alert (critical stat warning)
    if (alert) {
      const type = this.pet.isAlive ? "warning" : "error";
      this.ui.showToast(alert, type);
    }

    // Check achievements
    this._checkTickAchievements();
  }

  // ══════════════════════════════════════════════════════════
  //  INTERACTIONS
  // ══════════════════════════════════════════════════════════

  _feed() {
    if (!this.pet) return;
    const msg = this.pet.feed();
    this.ui.showToast(msg, msg.includes("!") ? "success" : "info");
    this.ui.render(this.pet);
    this.ui.flashButton("btn-feed");
    this.interactionCounts.feed++;
    this._checkInteractionAchievements("feed");
    this._saveGame();
  }

  _play() {
    if (!this.pet) return;
    const msg = this.pet.play();
    this.ui.showToast(msg, msg.includes("fun") ? "success" : "info");
    this.ui.render(this.pet);
    this.ui.flashButton("btn-play");
    this.interactionCounts.play++;
    this._checkInteractionAchievements("play");
    this._saveGame();
  }

  _sleep() {
    if (!this.pet) return;
    if (this.pet.state === "sleeping") {
      const msg = this.pet.wake();
      this.ui.showToast(msg, "info");
      document.getElementById("btn-sleep").textContent = "😴 Sleep";
    } else {
      const msg = this.pet.sleep();
      this.ui.showToast(msg, "info");
      document.getElementById("btn-sleep").textContent = "☀️ Wake Up";
    }
    this.ui.render(this.pet);
    this.ui.flashButton("btn-sleep");
    this._saveGame();
  }

  // ══════════════════════════════════════════════════════════
  //  DAY / NIGHT CYCLE
  // ══════════════════════════════════════════════════════════

  _updateDayNight() {
    const hour = new Date().getHours();
    let period;
    if (hour >= 5  && hour < 8)  period = "dawn";
    else if (hour >= 8  && hour < 18) period = "day";
    else if (hour >= 18 && hour < 21) period = "dusk";
    else                               period = "night";
    this.ui.setTimeOfDay(period);
  }

  // ══════════════════════════════════════════════════════════
  //  ACHIEVEMENTS
  // ══════════════════════════════════════════════════════════

  _checkInteractionAchievements(type) {
    const count = this.interactionCounts[type];
    for (const [id, ach] of Object.entries(this.ACHIEVEMENTS)) {
      if (ach.trigger === type && count >= ach.count && !this.achievements.has(id)) {
        this.achievements.add(id);
        this.ui.showAchievement(ach.title, ach.icon);
      }
    }
    // Stat-based achievements
    if (this.pet.happiness >= 95 && !this.achievements.has("max_happy")) {
      this.achievements.add("max_happy");
      this.ui.showAchievement(this.ACHIEVEMENTS.max_happy.title, this.ACHIEVEMENTS.max_happy.icon);
    }
  }

  _checkTickAchievements() {
    if (!this.pet) return;
    const tickAch = [
      { id: "survivor", count: 100  },
      { id: "senior",   count: 500  }
    ];
    for (const ta of tickAch) {
      if (this.pet.age >= ta.count && !this.achievements.has(ta.id)) {
        this.achievements.add(ta.id);
        const ach = this.ACHIEVEMENTS[ta.id];
        this.ui.showAchievement(ach.title, ach.icon);
      }
    }
    if (this.pet.health >= 95 && !this.achievements.has("good_health")) {
      this.achievements.add("good_health");
      this.ui.showAchievement(this.ACHIEVEMENTS.good_health.title, this.ACHIEVEMENTS.good_health.icon);
    }
  }

  // ══════════════════════════════════════════════════════════
  //  SAVE / LOAD
  // ══════════════════════════════════════════════════════════

  _saveGame() {
    if (!this.pet) return;
    try {
      const data = {
        pet: this.pet.toJSON(),
        achievements: [...this.achievements],
        interactionCounts: this.interactionCounts
      };
      sessionStorage.setItem("virtual_pet_save", JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  _loadGame() {
    try {
      const raw = sessionStorage.getItem("virtual_pet_save");
      if (!raw) { this.ui.showSelectScreen(); return; }
      const data = JSON.parse(raw);
      this.pet = Pet.fromJSON(data.pet);
      this.achievements = new Set(data.achievements || []);
      this.interactionCounts = data.interactionCounts || { feed: 0, play: 0 };

      // Show game screen with loaded pet
      this.ui.showGameScreen();
      this.ui.render(this.pet);
      this.ui.showToast(`🌟 Welcome back! ${this.pet.name} missed you!`, "success");

      // Restore sleep button state
      if (this.pet.state === "sleeping") {
        const sleepBtn = document.getElementById("btn-sleep");
        if (sleepBtn) sleepBtn.textContent = "☀️ Wake Up";
      }

      this._startLoop();
      this._updateDayNight();
    } catch (e) {
      // Corrupted save — show select screen
      sessionStorage.removeItem("virtual_pet_save");
      this.ui.showSelectScreen();
    }
  }
}

// ── BOOT ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  window.gameCtrl = new GameController();
});
