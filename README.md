# GamesOnWeb20242025
Project Overview

Lisani & Nisali is a 3D adventure game created using TypeScript and Babylon.js. The game is about a protagonist who travels to the dream world to confront his fears. At the beginning of the game, players can choose between Lisani (female) and Nisali (male).

Development Approach

A new Vite project was initialized to create the game.
3D objects were pre-designed in Blender and then imported into the game using Babylon.js.
We implemented different classes for a characte, for the game objects and for the test level.

Gameplay Features

Character movement: The protagonist can walk, jump, crawl. 
Hotkeys:

🎮 Movement Controls:
Key	Action
W / Arrow Up	Move Forward
S / Arrow Down	Move Backward
A / Arrow Left	Move Left
D / Arrow Right	Move Right

🏃‍♂️ Character Actions:
Key	Action
Spacebar	Jump (Only if the character is not crawling)
Shift Left	Crawl (Reduces height and movement speed)
C	Grab (Allows grabbing objects like the cube)

Whan character or cube catch the donuts it bounds.

Cube was added to demonstrate where the character can jump.

Installation & Setup

To run this project locally, follow these steps:

1. Clone the repository
   
git clone repo-link

cd project-folder


3. Install dependencies

npm install

npm install @babylonjs/core @babylonjs/loaders

4. Start the development server

npm run dev
