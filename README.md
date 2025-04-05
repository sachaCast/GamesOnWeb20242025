# 🎮 GamesOnWeb2024–2025 — *Lisani & Nisali*

## 🌌 Project Overview

**Lisani & Nisali** is a 3D adventure game built with **TypeScript** and **Babylon.js**.  
The story follows a protagonist who enters a dream world to confront his fears.  
At the beginning of the game, players choose between two characters:
- **Lisani** (female)
- **Nisali** (male)

## 🚀 Development Approach

- A new Vite project was initialized to structure the game environment.
- 3D models were pre-designed in **Blender**, exported as `.glb`, and imported using Babylon.js.
- Game architecture includes separate classes for:
  - The **character**
  - General **game objects**
  - The **test level**

## 🕹 Gameplay Features

### 🎮 Movement Controls

| Key             | Action         |
|------------------|----------------|
| `W` / `ArrowUp`    | Move forward   |
| `S` / `ArrowDown`  | Move backward  |
| `A` / `ArrowLeft`  | Move left      |
| `D` / `ArrowRight` | Move right     |

### 🏃‍♂️ Character Actions

| Key         | Action                                     |
|--------------|---------------------------------------------|
| `Spacebar`   | Jump (Only if not crawling)                |
| `ShiftLeft`  | Crawl (Reduces height and movement speed) |
| `C`          | Grab (Allows grabbing objects like the cube) |

- If the **character** or **cube** touches the **donuts**, they bounce back.
- A **cube** was added to demonstrate jumping and pushing mechanics.

---

## ⚔️ Combat System

- **Left Click** = Attack.
- Enemies must be inside the **red transparent square** (attack range).
- You must hit **spiders 3 times** to kill them.
- If the **player is hit 10 times**, they **die and respawn** at the initial point.
- Spider AI: they **crawl toward the player** by default.

> 💡 **Want to disable spider AI?**  
> Simply comment out the line below in `TestLevel.ts`:
```ts
// spider.crawl(mainCharacter);

##🛠 Installation & Setup

# 1. Clone the repository
git clone <your-repo-link>
cd <your-project-folder>

# 2. Install dependencies
npm install
npm install @babylonjs/core @babylonjs/loaders

# 3. Start the dev server
npm run dev
