# 🐾 Virtual Pet Simulator
### Unified Mentor Project — HTML, CSS, JavaScript

---

## 📁 Project Structure

```
virtual-pet-simulator/
│
├── index.html           ← Full game UI (select screen + game screen)
│
├── css/
│   └── style.css        ← Kawaii pastel theme, animations, day/night, responsive
│
├── js/
│   ├── pet.js           ← Pet class: attributes, state machine, interactions, decay
│   ├── ui.js            ← PetUI class: DOM updates, stat bars, toasts, animations
│   └── game.js          ← GameController: game loop, save/load, achievements
│
└── README.md            ← This file
```

---

## 🚀 How to Run

No build tools needed — just open `index.html` in any browser.

```bash
open index.html
# or
python3 -m http.server 3000
```

---

## 🎮 How to Play

1. **Choose a pet** from the selection screen (Cat, Dog, Bunny, Bear, Fox)
2. **Name your pet** and click "Start Adventure!"
3. **Keep your pet healthy** by monitoring 4 stats:
   - 🍽️ **Fullness** — Feed your pet before it starves
   - 😊 **Happiness** — Play to keep spirits high
   - ⚡ **Energy** — Let your pet sleep when tired
   - 💚 **Health** — Declines if other stats hit critical levels
4. **Watch the pet animate** — it reacts to its current mood!
5. **Earn achievements** by caring for your pet consistently

---

## 📊 Pet Attributes

| Stat | Range | Bad When | Good When |
|------|-------|----------|-----------|
| Hunger (shown as Fullness) | 0–100 | Fullness < 20% | Fullness > 60% |
| Happiness | 0–100 | < 25 | > 70 |
| Energy | 0–100 | < 20 | > 60 |
| Health | 0–100 | < 30 | > 70 |

---

## 🐾 Pet Types & Personalities

| Pet | Hungry Rate | Happy Rate | Energy Rate | Personality |
|-----|------------|------------|-------------|-------------|
| 🐱 Cat   | Medium | Fast  | Slow   | Aloof but loving |
| 🐶 Dog   | Fast   | Slow  | Medium | Loyal & excited  |
| 🐰 Bunny | Normal | Medium| Normal | Gentle & hoppy   |
| 🐻 Bear  | Very fast | Very slow | Fast | Loves naps |
| 🦊 Fox   | Medium | Medium| Medium | Curious & mischievous |

---

## 🏆 Achievements

| Achievement | How to Unlock |
|-------------|--------------|
| 🍽️ First Meal | Feed your pet for the first time |
| 🎾 Playtime! | Play with your pet for the first time |
| 😋 Well Fed | Feed your pet 10 times |
| 🎈 Playful Friend | Play with your pet 10 times |
| 💪 Survivor | Pet survives 100 game ticks |
| 👴 Senior Pet | Pet survives 500 game ticks |
| ✨ Pure Joy | Happiness reaches 95+ |
| 💚 In Good Health | Health reaches 95+ |

---

## 🌙 Day/Night Cycle (Bonus Feature)

The background changes automatically based on your real system clock:
- 🌅 **Dawn** (5 AM – 8 AM) — warm sunrise gradient
- ☀️ **Day** (8 AM – 6 PM) — soft pastel blues
- 🌇 **Dusk** (6 PM – 9 PM) — orange and purple sunset
- 🌙 **Night** (9 PM – 5 AM) — deep navy and violet

---

## 🏗️ Architecture

### `pet.js` — Pet Model
- `Pet` class manages all stats and state machine
- States: `happy → neutral → hungry → tired → sad → sleeping → sick → dead`
- `tick()` called every 5s — decays stats, checks health, returns alerts
- `feed()`, `play()`, `sleep()`, `wake()` are the four interactions
- Cooldowns prevent spam interactions
- `toJSON()` / `fromJSON()` for save/load

### `ui.js` — UI Renderer
- `PetUI` class handles all DOM updates
- `render(pet)` updates pet visual + stat bars + info panel
- `showToast()` — queued notification system
- `setTimeOfDay()` — applies background class
- `showAchievement()` — shows popup + adds to list

### `game.js` — Controller
- `GameController` wires Pet + PetUI together
- 5-second `setInterval` game loop calls `pet.tick()`
- Handles all button clicks
- Achievement checking after each interaction + tick
- `sessionStorage` save/load preserves progress across page reloads

---

## ✅ Requirements Checklist

- [x] Virtual pet with hunger, happiness, energy attributes
- [x] Animated pet character (7 mood states)
- [x] Feed, Play, Sleep interactions
- [x] Stat bars with real-time updates
- [x] Pet animations reflecting current state
- [x] Game logic: attribute decay, health system, death
- [x] ⭐ BONUS: Multiple pet types (5 types, different personalities)
- [x] ⭐ BONUS: Day/night cycle (real-time)
- [x] ⭐ BONUS: Achievements system (8 achievements)
- [x] Responsive design (mobile + desktop)
- [x] Session persistence (survives page reload)
- [x] Well-commented, organized code

---

*Built for Unified Mentor — Virtual Pet Simulator Project*
