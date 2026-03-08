/**
 * pet.js
 * Defines the Pet class — core data model for the virtual pet.
 *
 * Attributes (each 0–100):
 *   hunger    — higher = more hungry (bad). Fed = reduces hunger.
 *   happiness — higher = happier (good). Play = increases happiness.
 *   energy    — higher = more energy (good). Sleep = restores energy.
 *   health    — overall wellbeing. Decays if other stats go critical.
 *
 * States: 'happy' | 'hungry' | 'tired' | 'sad' | 'sleeping' | 'sick' | 'dead'
 *
 * Pet Types (bonus feature):
 *   cat 🐱, dog 🐶, bunny 🐰, bear 🐻, fox 🦊
 */

// ── PET TYPE DEFINITIONS ────────────────────────────────────────
const PET_TYPES = {
  cat: {
    name: "Cat",
    emoji: "🐱",
    bodyColor: "#ffb3d1",
    accentColor: "#ff80b3",
    // Decay rates per game tick (every 5s)
    hungerRate:    1.2,  // Cats get hungry a bit fast
    happinessRate: 1.5,  // Cats get bored easily
    energyRate:    0.8,
    personality: "Aloof but secretly loving 💕"
  },
  dog: {
    name: "Dog",
    emoji: "🐶",
    bodyColor: "#ffd580",
    accentColor: "#ffaa00",
    hungerRate:    1.5,
    happinessRate: 0.8,  // Dogs stay happy longer
    energyRate:    1.2,
    personality: "Loyal and always excited! 🎾"
  },
  bunny: {
    name: "Bunny",
    emoji: "🐰",
    bodyColor: "#c8f0c8",
    accentColor: "#70d070",
    hungerRate:    1.0,
    happinessRate: 1.2,
    energyRate:    1.0,
    personality: "Gentle and loves to hop 🌿"
  },
  bear: {
    name: "Bear",
    emoji: "🐻",
    bodyColor: "#d4b896",
    accentColor: "#a07850",
    hungerRate:    1.8,  // Bears eat a lot
    happinessRate: 0.6,  // Very chill
    energyRate:    1.5,
    personality: "Big, cozy, and loves naps 🍯"
  },
  fox: {
    name: "Fox",
    emoji: "🦊",
    bodyColor: "#ffb07a",
    accentColor: "#e0603a",
    hungerRate:    1.3,
    happinessRate: 1.3,
    energyRate:    1.1,
    personality: "Curious and a bit mischievous 🌙"
  }
};

// ── PET CLASS ───────────────────────────────────────────────────
class Pet {
  /**
   * @param {string} type  - Key from PET_TYPES
   * @param {string} name  - User-given name
   */
  constructor(type = "cat", name = "Mochi") {
    this.type      = type;
    this.name      = name;
    this.typeData  = PET_TYPES[type];

    // ── Attributes (0–100) ──────────────────────────────────
    this.hunger    = 30;   // 0 = full, 100 = starving
    this.happiness = 80;   // 0 = miserable, 100 = ecstatic
    this.energy    = 70;   // 0 = exhausted, 100 = fully rested
    this.health    = 100;  // 0 = dead, 100 = perfect health

    // ── Age / Experience ────────────────────────────────────
    this.age       = 0;    // In game ticks
    this.level     = 1;    // Increases every 100 ticks
    this.xp        = 0;    // XP earned from interactions

    // ── State ───────────────────────────────────────────────
    this.state     = "happy";   // Current mood/state
    this.isAlive   = true;

    // ── Interaction cooldowns (ticks) ───────────────────────
    this.feedCooldown  = 0;
    this.playCooldown  = 0;
    this.sleepCooldown = 0;
  }

  // ══════════════════════════════════════════════════════════
  //  INTERACTIONS
  // ══════════════════════════════════════════════════════════

  /**
   * Feed the pet — reduces hunger, slightly increases health
   * @returns {string} feedback message
   */
  feed() {
    if (!this.isAlive) return "💔 Your pet is gone...";
    if (this.state === "sleeping") return "😴 Shh! " + this.name + " is sleeping!";
    if (this.feedCooldown > 0) return "😊 " + this.name + " is still full!";

    const amount = 30;
    this.hunger    = Math.max(0, this.hunger - amount);
    this.happiness = Math.min(100, this.happiness + 8);
    this.health    = Math.min(100, this.health + 3);
    this.xp        += 5;
    this.feedCooldown = 4;

    // Force awake state so _updateState() can compute correctly
    if (this.state === "sleeping") this.state = "neutral";
    this._updateState();
    return `😋 ${this.name} enjoyed the meal! Yum yum!`;
  }

  /**
   * Play with the pet — increases happiness, costs energy
   * @returns {string} feedback message
   */
  play() {
    if (!this.isAlive) return "💔 Your pet is gone...";
    if (this.state === "sleeping") return "😴 Let " + this.name + " rest first!";
    if (this.energy < 15) return "😓 " + this.name + " is too tired to play!";
    if (this.playCooldown > 0) return "😤 " + this.name + " needs a little break!";

    this.happiness = Math.min(100, this.happiness + 25);
    this.energy    = Math.max(0,   this.energy    - 20);
    this.hunger    = Math.min(100, this.hunger    + 10);
    this.xp        += 8;
    this.playCooldown = 3;

    // Force awake state so _updateState() can compute correctly
    if (this.state === "sleeping") this.state = "neutral";
    this._updateState();
    return `🎉 ${this.name} had so much fun! Look at those happy eyes!`;
  }

  /**
   * Put the pet to sleep — restores energy over multiple ticks
   * @returns {string} feedback message
   */
  sleep() {
    if (!this.isAlive) return "💔 Your pet is gone...";
    if (this.state === "sleeping") return "💤 " + this.name + " is already dreaming...";
    if (this.sleepCooldown > 0) return "😊 " + this.name + " isn't sleepy yet!";

    this.state = "sleeping";
    return `🌙 Sweet dreams, ${this.name}! Zzz...`;
  }

  /**
   * Wake the pet up manually
   * @returns {string} feedback message
   */
  wake() {
    if (this.state !== "sleeping") return `${this.name} is already awake!`;
    this.state = "happy";
    this.sleepCooldown = 6;
    this._updateState();
    return `☀️ Good morning, ${this.name}! Rise and shine!`;
  }

  // ══════════════════════════════════════════════════════════
  //  GAME TICK (called every 5 seconds by game loop)
  // ══════════════════════════════════════════════════════════

  /**
   * Advance one game tick — decay stats, update state
   * @returns {string|null} alert message if stat is critical
   */
  tick() {
    if (!this.isAlive) return null;

    this.age++;
    this.xp++;

    // Level up every 100 ticks
    if (this.age % 100 === 0) {
      this.level++;
    }

    // Decrement cooldowns
    if (this.feedCooldown  > 0) this.feedCooldown--;
    if (this.playCooldown  > 0) this.playCooldown--;
    if (this.sleepCooldown > 0) this.sleepCooldown--;

    // ── Sleeping state: restore energy ──────────────────────
    if (this.state === "sleeping") {
      this.energy    = Math.min(100, this.energy + 8);
      this.happiness = Math.min(100, this.happiness + 2);
      // Wake up automatically when energy is full
      if (this.energy >= 100) {
        this.state = "happy";
        this.sleepCooldown = 6;
        return `☀️ ${this.name} woke up feeling refreshed!`;
      }
      return null;
    }

    // ── Awake state: decay stats ─────────────────────────────
    const td = this.typeData;
    this.hunger    = Math.min(100, this.hunger    + td.hungerRate);
    this.happiness = Math.max(0,   this.happiness - td.happinessRate);
    this.energy    = Math.max(0,   this.energy    - td.energyRate);

    // ── Health decay when stats are critical ─────────────────
    let healthDelta = 0;
    if (this.hunger    > 80) healthDelta -= 2;
    if (this.happiness < 20) healthDelta -= 1;
    if (this.energy    < 10) healthDelta -= 1;
    if (healthDelta === 0 && this.hunger < 50 && this.happiness > 50) healthDelta = 0.5;

    this.health = Math.min(100, Math.max(0, this.health + healthDelta));

    // ── Death check ──────────────────────────────────────────
    if (this.health <= 0) {
      this.isAlive = false;
      this.state   = "dead";
      return `💔 Oh no! ${this.name} has passed away... Please take better care next time.`;
    }

    // ── Update state & return alert if needed ────────────────
    this._updateState();
    return this._getCriticalAlert();
  }

  // ══════════════════════════════════════════════════════════
  //  STATE MACHINE
  // ══════════════════════════════════════════════════════════

  _updateState() {
    // Always handle dead/sleeping first — never override these
    if (!this.isAlive)            { this.state = "dead";    return; }
    if (this.state === "sleeping") return; // sleeping can only be exited by wake()

    // Priority order: worst condition wins
    if (this.health < 30)         { this.state = "sick";    return; }
    if (this.hunger > 70)         { this.state = "hungry";  return; }
    if (this.energy < 25)         { this.state = "tired";   return; }
    if (this.happiness < 30)      { this.state = "sad";     return; }

    // Happy: well-fed, energised, content
    if (this.happiness >= 60 && this.hunger < 60 && this.energy >= 40) {
                                    this.state = "happy";   return; }

    // Everything else is neutral
    this.state = "neutral";
  }

  _getCriticalAlert() {
    if (this.hunger    > 85) return `🍽️ ${this.name} is STARVING! Feed me now!`;
    if (this.happiness < 15) return `😢 ${this.name} is really sad... please play!`;
    if (this.energy    < 10) return `😴 ${this.name} can barely keep their eyes open!`;
    if (this.health    < 30) return `🤒 ${this.name} is feeling very sick!`;
    return null;
  }

  // ══════════════════════════════════════════════════════════
  //  SERIALIZATION (save / load)
  // ══════════════════════════════════════════════════════════

  toJSON() {
    return {
      type: this.type, name: this.name,
      hunger: this.hunger, happiness: this.happiness,
      energy: this.energy, health: this.health,
      age: this.age, level: this.level, xp: this.xp,
      state: this.state, isAlive: this.isAlive
    };
  }

  static fromJSON(data) {
    const p = new Pet(data.type, data.name);
    Object.assign(p, data);
    p.typeData = PET_TYPES[data.type];
    // If pet was saved mid-sleep, wake it up so it
    // doesn't load permanently stuck in sleeping animation
    if (p.state === "sleeping") {
      p.state = "neutral";
      p.sleepCooldown = 0;
    }
    // Re-derive correct state from current stats
    p._updateState();
    return p;
  }
}
