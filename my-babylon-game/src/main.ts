import { Engine, Scene, SceneLoader, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, FollowCamera } from "@babylonjs/core";
import "@babylonjs/loaders";

// Get the canvas and create the engine
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

// Create the scene
const scene = new Scene(engine);

// Lighting
const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// Create ground
const groundSize = 20;
const ground = MeshBuilder.CreateGround("ground", { width: groundSize, height: groundSize }, scene);
const groundMaterial = new StandardMaterial("groundMat", scene);
groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
ground.material = groundMaterial;

// Create character
const character = MeshBuilder.CreateSphere("character", { diameter: 1.2 }, scene);
character.position = new Vector3(0, 0.6, 0);

const characterMaterial = new StandardMaterial("characterMat", scene);
characterMaterial.diffuseColor = Color3.Red();
character.material = characterMaterial;

let donuts: any[] = []; // Array to hold the donut meshes
let donut: any; let donut2 :any; let donut3 : any;
SceneLoader.ImportMesh("", "/donut.glb", "", scene, (meshes) => {
  donut = meshes[0]; // Assigner le premier mesh du modèle
  donut.position = new Vector3(5, 1, 0); // Position initiale
  donuts.push(donut);
  donut2 = meshes[0].clone("donut2", null); // Assigner le premier mesh du modèle
  donut2.position = new Vector3(-5, 1, 0); // Position initiale
  donuts.push(donut2);
  donut3 = meshes[0].clone("donut3", null); // Assigner le premier mesh du modèle
  donut3.position = new Vector3(0, 1, 5); // Position initiale
  donuts.push(donut3);

  donuts.forEach(donut => {
    donut.scaling = new Vector3(5, 5, 5); // Scale each donut
  });

  console.log("Donut chargé !");
}, null, (message) => {
  console.error("Erreur de chargement :", message);
});

// Create follow camera
const camera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), scene);
camera.lockedTarget = character; // The camera follows the character
camera.radius = 10;
camera.heightOffset = 5;
camera.rotationOffset = 0;

// Disable user camera controls
camera.inputs.clear();

// Movement logic
const speed = 0.08;
const keys: Record<string, boolean> = {}; // Store pressed keys
const boundary = groundSize / 2 - 1; // Character movement boundaries

const keyMappings: Record<string, string> = {
    "KeyW": "forward",
    "KeyS": "backward",
    "KeyA": "right",
    "KeyD": "left",
    "ArrowUp": "forward",
    "ArrowDown": "backward",
    "ArrowLeft": "right",
    "ArrowRight": "left"
};

// Handle key press events
window.addEventListener("keydown", (event) => {
    const action = keyMappings[event.code];
    if (action) keys[action] = true;
});

// Handle key release events
window.addEventListener("keyup", (event) => {
    const action = keyMappings[event.code];
    if (action) keys[action] = false;
});

// Gravity and jumping
let velocityY = 0;
const gravity = -0.005;
const jumpStrength = 0.15;
let isJumping = false;

window.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !isJumping) {
        velocityY = jumpStrength;
        isJumping = true;
    }
});

const bounceForce = 0.5;
// Game loop
engine.runRenderLoop(() => {
    let moveDirection = new Vector3(0, 0, 0);

    // Determine movement direction
    if (keys["forward"]) moveDirection.z -= 1;
    if (keys["backward"]) moveDirection.z += 1;
    if (keys["left"]) moveDirection.x -= 1;
    if (keys["right"]) moveDirection.x += 1;

    moveDirection.normalize();

    // Calculate new position
    const newPosition = character.position.add(moveDirection.scale(speed));

    // Restrict movement within field boundaries
    if (newPosition.x > -boundary && newPosition.x < boundary && newPosition.z > -boundary && newPosition.z < boundary) {
        character.position = newPosition;
    }

    // Gravity and jumping
    if (isJumping) {
        character.position.y += velocityY;
        velocityY += gravity;
        if (character.position.y <= 0.6) {
            character.position.y = 0.6;
            isJumping = false;
            velocityY = 0;
        }
    }

    // Check for collisions with any of the donuts
    donuts.forEach(donut => {
      const distance = Vector3.Distance(character.position, donut.position);
      if (distance < 1) { // Collision threshold
          const direction = character.position.subtract(donut.position).normalize();
          character.position.x += direction.x * bounceForce;
          character.position.z += direction.z * bounceForce;
      }
    });

    scene.render();
});

// Window resize event listener
window.addEventListener("resize", () => {
    engine.resize();
});