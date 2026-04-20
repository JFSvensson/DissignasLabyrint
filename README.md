# Dissignas Labyrint
![alt text](<DALL·E 2024-10-27 15.03.55 - A mystical labyrinth in a Nordic mythology-inspired setting, with a female figure named Dissigna at the entrance. Dissigna appears as a wise and ether.webp>)
---

# The Labyrinth of Dissigna
A game of math and logic set in a world of Norse mythology.

## About

Dissignas Labyrint is an educational web game where the player navigates a 3D maze by solving math problems. The difficulty increases as you progress deeper into the labyrinth — from simple addition near the entrance to multiplication and division near the goal.

**Features:**
- 3D maze rendered with Three.js
- 6 math operations: addition, subtraction, multiplication, division, modulo, power
- Progressive difficulty based on maze position (3 tiers of operations)
- Selectable maze size (5×5 to 13×13) and math difficulty (easy/medium/hard)
- 7-level progression system with increasing challenge
- Level mode (structured progression) and free play mode from the start screen
- Exploration tracking with live progress bar and percentage
- Voluntary goal completion — player chooses when to finish
- Star rating system (1–3 stars based on exploration % and accuracy)
- Exploration bonus: extra score for thorough maze coverage
- Visual themes: Stone Dungeon, Forest, Space Station — rotate by level or maze size
- Optional countdown timer for extra challenge
- Tutorial / how-to-play screen
- Visited cells highlighted in 3D view
- Dynamic camera adapting to maze size
- Score tracking with streak bonuses
- Power-ups: hint, time bonus, score multiplier — visible as floating 3D objects
- Background music (ambient chord with toggle)
- Keyboard navigation (WASD + arrow keys)
- Accessibility: ARIA roles, labels, live regions
- High score persistence (localStorage)
- Highscore leaderboard (top 10)
- Multi-language support (Swedish, English, Norwegian, Finnish, Danish) — selectable from start screen
- Procedural sound effects (Web Audio API)
- Share results (Web Share API / clipboard)
- PWA: installable, works offline (service worker caches fonts too)
- Responsive design (desktop & mobile)

## Getting Started

### Prerequisites
- Node.js (v22+)
- npm

### Install dependencies
```bash
npm install
```

### Run in development mode
```bash
npm run dev
```
Open http://localhost:8080 in your browser.

### Build for production
```bash
npm run build
```
Output is written to the `dist/` folder.

### Run tests
```bash
npm test
```

### Lint & format
```bash
npm run lint        # Check for lint errors
npm run lint:fix    # Auto-fix lint errors
npm run format      # Format code with Prettier
```

### Deploy to GitHub Pages
The project includes a GitHub Actions workflow that automatically tests and deploys to GitHub Pages on push to `main`. Enable Pages in your repo settings with "GitHub Actions" as the source.

## Project Structure

```
src/
  web.ts                  # Entry point, game flow & level progression
  game/
    GameConfig.ts         # Difficulty settings, level definitions
    GameSession.ts        # Orchestrates a single game session
    GameTimer.ts          # Countdown timer component
    StartScreen.ts        # Start/settings screen with level mode & free play
    ExplorationTracker.ts # Tracks visited cells and exploration percentage
    StarRating.ts         # Star rating & exploration bonus calculation
    VictoryScreen.ts      # Victory overlay with stars, exploration stats
    MazeGenerator.ts      # Recursive backtracking maze algorithm
    MazeLogic.ts          # Game state, movement, events
    MazeRenderer.ts       # Three.js 3D rendering, visited cells, power-ups, themes
    Player.ts             # Player entity (logic + mesh)
    PlayerLogic.ts        # Pure player state management
    PowerUpManager.ts     # Power-up placement & collection
    QuestionGenerator.ts  # Difficulty-scaled math questions
    ScoreTracker.ts       # Points, streaks, accuracy
    StatsManager.ts       # Persistent stats, high scores & best stars (localStorage)
    SoundManager.ts       # Procedural audio (Web Audio API)
    themes.ts             # Visual theme definitions (stone, forest, space)
    UI.ts                 # Game UI (DOM), timer, level, exploration bar
    types.ts              # TypeScript type definitions
    constants.ts          # Game constants
  operations/             # Math operations (Addition, Subtraction, Multiplication, Division, Modulo, Power)
  services/
    TranslationService.ts # i18n singleton
  locales/                # sv, en, no, fi, da
  types/
    translations.ts       # Type-safe translation keys
.github/workflows/ci.yml  # CI/CD: test + deploy to GitHub Pages
tests/                    # Jest test suite (288 tests)
public/
  index.html              # PWA-enabled HTML shell
  manifest.json           # PWA manifest
  sw.js                   # Service worker (offline cache)
  icons/                  # App icons
  css/game.css
  docs/                   # Architecture documentation & diagrams
```

## How to Play

1. You start at the top-left corner of the maze
2. Available directions show math questions to solve
3. Enter your answer and click a direction button
4. Correct answer → you move in that direction
5. Wrong answer → you are sent back to start
6. Reach the golden goal at the bottom-right to win!

## License

ISC
