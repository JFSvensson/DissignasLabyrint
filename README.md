# Dissignas Labyrint
![alt text](<DALL·E 2024-10-27 15.03.55 - A mystical labyrinth in a Nordic mythology-inspired setting, with a female figure named Dissigna at the entrance. Dissigna appears as a wise and ether.webp>)
---

# The Labyrinth of Dissigna
A game of math and logic set in a world of Norse mythology.

## About

Dissignas Labyrint is an educational web game where the player navigates a 3D maze by solving math problems. The difficulty increases as you progress deeper into the labyrinth — from simple addition near the entrance to multiplication and division near the goal.

**Features:**
- 3D maze rendered with Three.js
- 4 math operations: addition, subtraction, multiplication, division
- Progressive difficulty based on maze position
- Selectable maze size (5×5 to 13×13) and math difficulty (easy/medium/hard)
- 7-level progression system with increasing challenge
- Optional countdown timer for extra challenge
- Tutorial / how-to-play screen
- Visited cells highlighted in 3D view
- Dynamic camera adapting to maze size
- Score tracking with streak bonuses
- Multi-language support (Swedish / English)
- Procedural sound effects (Web Audio API)
- Responsive design (desktop & mobile)

## Getting Started

### Prerequisites
- Node.js (v18+)
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

## Project Structure

```
src/
  web.ts                  # Entry point, game flow & level progression
  game/
    GameConfig.ts         # Difficulty settings, level definitions
    GameTimer.ts          # Countdown timer component
    StartScreen.ts        # Start/settings screen with tutorial
    MazeGenerator.ts      # Recursive backtracking maze algorithm
    MazeLogic.ts          # Game state, movement, events
    MazeRenderer.ts       # Three.js 3D rendering, visited cells
    Player.ts             # Player entity (logic + mesh)
    PlayerLogic.ts        # Pure player state management
    QuestionGenerator.ts  # Difficulty-scaled math questions
    ScoreTracker.ts       # Points, streaks, accuracy
    SoundManager.ts       # Procedural audio (Web Audio API)
    UI.ts                 # Game UI (DOM), timer & level display
    types.ts              # TypeScript type definitions
    constants.ts          # Game constants
  operations/             # Math operations (Addition, Subtraction, etc.)
  services/
    TranslationService.ts # i18n singleton
  locales/                # sv.json, en.json
  types/
    translations.ts       # Type-safe translation keys
tests/                    # Jest test suite (168 tests)
public/
  index.html
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
