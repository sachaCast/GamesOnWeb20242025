import { Color3, Scene, Vector3 } from "@babylonjs/core";
import TestLevel from "./TestLevel";
import Character from "./Character";

let levelTest: TestLevel;

function createTestLevel(): Scene {
    levelTest = new TestLevel();
    const mainCharacter = new Character(levelTest.scene, new Vector3(0, 0.6, 0), Color3.Red());
    // Appel de la fonction starting pour démarrer la boucle de rendu
    levelTest.starting(mainCharacter);

    return levelTest.scene;
}

// Créer et initialiser la scène
const scene = createTestLevel();

// Gérer le redimensionnement de la fenêtre
window.addEventListener("resize", () => {
    if (levelTest && levelTest.engine) {
        levelTest.engine.resize();
    }
});