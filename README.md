# 🎮 GamesOnWeb2024–2025 — *Lisani & Nisali*

## 👥 About the Team

- Mikita Sidarenka
- Sacha Castillejos
- Yelyzaveta Ploskonos

## Link
Play the game at [https://sachacast.github.io/GamesOnWeb20242025/](https://sachacast.github.io/GamesOnWeb20242025/)

## 🌌 Project Overview

**Lisani & Nisali** is a 3D adventure game built with **TypeScript** and **Babylon.js**. The story follows a protagonist who enters a dream world to confront their fears. At the beginning of the game, players choose between two characters:
- **Lisani** (female)
- **Nisali** (male)

## 📽️ Gameplay Demo

- **Direct Link**: [Watch Gameplay Video](video.mkv) (Download or play in a compatible player like VLC).

## 🚀 Development Approach

- Initialized a new **Vite** project to structure the game environment.
- Designed 3D models in **Blender**, exported as `.glb` files, and imported using **Babylon.js**.
- Game architecture includes separate classes for:
  - **Character** (player controls and actions)
  - **Game Objects** (interactive elements like cubes and donuts)
  - **Level** (environment, enemies, and boss)
  - **Spider** (enemy AI and combat)
  - **Boss** (final enemy encounter)

## 🕹 Gameplay Features

The game takes place in a 3D environment across two levels, each designed to confront a specific fear. In the first level, players face their fear of spiders in a room with stairs and a path leading to a boss arena. Players must navigate the level, collect objects, and defeat all spiders to progress. Only after defeating all spiders can players advance to the second level, where they are immersed directly in water, confronting their fear of water in an aquatic maze environment with fish and bubble effects.

### 🎮 Movement Controls

| Key (QWERTY)       | Key (AZERTY)       | Action         |
|--------------------|--------------------|----------------|
| `W` / `ArrowUp`    | `Z` / `ArrowUp`    | Move forward   |
| `S` / `ArrowDown`  | `S` / `ArrowDown`  | Move backward  |
| `A` / `ArrowLeft`  | `Q` / `ArrowLeft`  | Move left      |
| `D` / `ArrowRight` | `D` / `ArrowRight` | Move right     |

### 🏃‍♂️ Character Actions (First Level)

| Key         | Action                                     |
|-------------|--------------------------------------------|
| `Spacebar`  | Jump (only if not crawling)                |
| `ShiftLeft` | Crawl (reduces height and movement speed)  |
| `C`         | Grab (interact with objects like the cube) |

### 🏊‍♂️ Character Actions (Second Level)

| Key         | Action                                     |
|-------------|--------------------------------------------|
| `Spacebar`  | Move upward in water                       |
| `ShiftLeft` | Move downward in water                     |
| `C`         | Grab (interact with objects, optional)     |

- **Cube Interaction**: A pushable cube can be grabbed with `C` and moved to unlock a path to the next area.
- **Collectibles**: 5 donuts are scattered across the level. Collecting a donut updates the on-screen UI (e.g., "donuts: 2/5").

## ⚔️ Combat System

- **Attack**: Triggered by **Left Click**, creating a red transparent square around the player to indicate attack range.
- **Collectibles and Enemies**:
  - **Donuts (First Level)**: 5 collectible donuts are scattered throughout the level. Collecting them updates the on-screen counter (e.g., "donuts: 2/5").
  - **Spiders (First Level)**: Each spider requires **3 hits** to defeat and crawls toward the player when nearby.
  - **Boss Spider (First Level)**: A larger enemy at the end of the level requires multiple hits to defeat. Upon defeating the boss.
  - **Fish (Second Level)**: Fish are present in the water environment, adding to the immersive aquatic setting (no combat with fish currently).
- **Player Health**: The player has **10 HP**, displayed on-screen. Taking **10 hits** from spiders or the boss causes the player to die, triggering a respawn after a 2-second delay with the level reset.
- **UI Feedback**: The on-screen display shows the player's current HP (e.g., "HP: 8/10") and the number of donuts collected (e.g., "donuts: 2/5").
- **Spider AI**: Spiders activate after passing the cube area, they **crawl toward the player** by default.

## 🛠 Installation & Setup

```bash
# 1. Clone the repository
git clone <your-repo-link>
cd <your-project-folder>

# 2. Install dependencies
npm install
npm install @babylonjs/core @babylonjs/loaders

# 3. Start the dev server
npm run dev
```
