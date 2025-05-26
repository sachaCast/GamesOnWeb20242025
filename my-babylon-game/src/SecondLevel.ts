import {
    Engine,
    Scene,
    MeshBuilder,
    Vector3,
    StandardMaterial,
    Color3,
    HemisphericLight,
    ArcRotateCamera,
    AbstractMesh,
    FollowCamera,
    PhotoDome,
    SceneLoader,
    Tools,
    Texture
} from "@babylonjs/core";

import Character from "./character";
import { Boss } from "./Boss";
import { GameObject } from "./GameObject";

export default class SecondLevel {
    public scene: Scene;
    public engine: Engine;
    public canvas: HTMLCanvasElement;
    public ready: Promise<void>;
    public mainCharacter!: Character;
    public isAttacking = false;
    private healthDisplay: HTMLElement | undefined;
    private donutsDisplay: HTMLElement | undefined;
    private positionDisplay: HTMLElement | undefined;
    private finishDisplay: HTMLElement | undefined;
    public donuts: GameObject[] = [];
    private donutsFound: number;
    private boss: Boss | undefined;
    private levelFinished: boolean = false;
    private groundSize: number = 20;
    public boundary = this.groundSize / 2 - 1; // Character movement boundaries


    constructor() {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.donutsFound = 0;
        const loadingDiv = document.getElementById("loadingScreen");
        if (loadingDiv) loadingDiv.style.display = "flex";
        this.ready = this.createLevel().then(() => {
            if (loadingDiv) {
                loadingDiv.classList.add("fade-out");
                setTimeout(() => loadingDiv.remove(), 1000);
            }
        });    }

    public async createLevel(): Promise<void> {
        this.donutsFound = 0;
        this.donuts = [];
        this.createLighting();
        this.healthDisplay = document.getElementById("healthDisplay")!;
        this.positionDisplay = document.getElementById("positionDisplay")!;
        this.donutsDisplay = document.getElementById("donutsDisplay")!;
        this.finishDisplay = document.getElementById("finishDisplay")!;

        await Promise.all([
            //this.loadBos
            this.loadLevel()
            //this.loadDonuts()
        ]);
    }

    private createLighting(): void {
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.9;
    }

    public async resetLevel(): Promise<void> {
        this.scene.meshes.forEach((mesh: AbstractMesh) => mesh.dispose());
        this.scene.materials.forEach(mat => mat.dispose());
        this.scene.lights.forEach(light => light.dispose());
        const loadingDiv = document.getElementById("loadingScreen");
        if (loadingDiv) loadingDiv.style.display = "flex";
        this.ready = this.createLevel().then(() => {
            if (loadingDiv) {
                loadingDiv.classList.add("fade-out");
                setTimeout(() => loadingDiv.remove(), 1000);
            }
        });
    }


    public async loadLevel(): Promise<void> {
        return new Promise((resolve) => {
            SceneLoader.ImportMesh(null, "/", "level2_finished.glb", this.scene, (meshes) => {
                console.log("Level loaded!", meshes);

                meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.receiveShadows = true;
                });
                meshes[0].scaling = new Vector3(2, 2, -2); // x2 plus grand
                meshes[0].position = new Vector3(-80, 0, -30);
                //meshes[0].rotation = new Vector3(0, Tools.ToRadians(-90), 0);

                //Add invisible ground under the model !!!!!!!!! IF WE NEED IT !!!!!!!
                //11111111111111111111111111111111111111
                const invisibleGround1 = MeshBuilder.CreateGround("invisibleGround", {
                    width: 200,
                    height: 50
                }, this.scene);

                invisibleGround1.position = new Vector3(-51.2, 0, 0); // Just below the level
                invisibleGround1.isVisible = false; // Make it invisible
                invisibleGround1.checkCollisions = true; // Enable collision
                const groundMaterial1 = new StandardMaterial("groundMat", this.scene);
                const groundTexture1 = new Texture("/textures/Metal027_1K-JPG_Color.jpg", this.scene);
                groundMaterial1.diffuseTexture = groundTexture1;
                invisibleGround1.material = groundMaterial1;


                ///222222222222222222222222222222222222
                const invisibleGround2 = MeshBuilder.CreateGround("invisibleGround", {
                    width: 48,
                    height: 100
                }, this.scene);

                invisibleGround2.position = new Vector3(-82, -8.3, 0); // Just below the level
                invisibleGround2.isVisible = false; // Make it invisible
                invisibleGround2.checkCollisions = true; // Enable collision
                const groundMaterial2 = new StandardMaterial("groundMat", this.scene);
                const groundTexture2 = new Texture("/textures/Metal027_1K-JPG_Color.jpg", this.scene);
                groundMaterial2.diffuseTexture = groundTexture2;
                invisibleGround2.material = groundMaterial2;

                const wallThickness = 0.5; // thin box wall
                const wallHeight = 100;      // height of the wall
                const groundWidth = 65;
                const groundDepth = 8.8;
                const groundCenter = new Vector3(-63.2, -10.51, 0);

                // Back wall
                const backWall = MeshBuilder.CreateBox("backWall", {
                    width: groundWidth,
                    height: wallHeight,
                    depth: wallThickness
                }, this.scene);

                backWall.position = new Vector3(
                    groundCenter.x,
                    groundCenter.y + wallHeight / 2,
                    groundCenter.z - (groundDepth / 2) -5
                );
                backWall.isVisible = false;
                backWall.checkCollisions = true;
                backWall.freezeWorldMatrix();

                // Front wall
                const frontWall = MeshBuilder.CreateBox("frontWall", {
                    width: groundWidth,
                    height: wallHeight,
                    depth: wallThickness
                }, this.scene);

                frontWall.position = new Vector3(
                    groundCenter.x,
                    groundCenter.y + wallHeight / 2,
                    groundCenter.z + (groundDepth / 2) + 3
                );
                frontWall.isVisible = false;
                frontWall.checkCollisions = true;
                frontWall.freezeWorldMatrix();
                resolve();
            });

        });

    }

    public starting(character: Character): void {

        this.mainCharacter = character;
        const bounceForce = 0.5;
                const camera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), this.scene);
                camera.lockedTarget = this.mainCharacter.collisionMesh; // The camera follows the character
                camera.radius = 10;
                camera.heightOffset = 5;
                camera.rotationOffset = 0;
                // Disable user camera controls
                camera.inputs.clear();

                const keys: Record<string, boolean> = {}; // Store pressed keys

                new PhotoDome("sky", "/textures/Metal027_1K-JPG_Color.jpg", {
                    resolution: 32,
                    size: 1000
                }, this.scene);

                const keyMappings: Record<string, string> = {
                    "KeyW": "forward",
                    "KeyS": "backward",
                    "KeyA": "right",
                    "KeyD": "left",
                    "ArrowUp": "forward",
                    "ArrowDown": "backward",
                    "ArrowLeft": "right",
                    "ArrowRight": "left",
                    "ShiftLeft": "crawl",
                    "KeyC": "grab",
                };

                this.scene.onPointerDown = (evt, pickInfo) => {
                    if (evt.button === 0) { // Clic gauche
                        this.isAttacking = true;
                        console.log("Attaque avec clic gauche !");

                    }
                };

                this.scene.onPointerUp = (evt) => {
                    if (evt.button === 0) {
                        this.isAttacking = false;
                    }
                };

                window.addEventListener("keydown", (event) => {
                    const action = keyMappings[event.code];
                    if (action) keys[action] = true;

                    // Crawl mechanic
                    if (event.code === "ShiftLeft") {
                        this.mainCharacter.crawl(true);
                    }

                    if (event.code === "KeyC") {
                        this.mainCharacter.isGrabbing = true;
                    }

                    if (event.code === "Space" && !this.mainCharacter.isJumping && this.mainCharacter.mesh.scaling.y === 1) {
                        this.mainCharacter.velocityY = this.mainCharacter.jumpStrength;
                        this.mainCharacter.isJumping = true;
                    }

                    if (event.code === "Space" && this.mainCharacter.isGrounded() && this.mainCharacter.canJump) {
                        this.mainCharacter.jump();
                    }
                });

                // Handle key release events
                window.addEventListener("keyup", (event) => {
                    const action = keyMappings[event.code];
                    if (action) keys[action] = false;

                    // Restore normal size when shift is released
                    if (event.code === "ShiftLeft") {
                        this.mainCharacter.crawl(false);
                    }

                    if (event.code === "KeyC") {
                        this.mainCharacter.isGrabbing = false;
                    }
                });

                this.engine.runRenderLoop(() => {

                    //if (!mainCharacter.isAlive || !mainCharacter.isLoaded) return;
                    if( this.healthDisplay!=null) this.healthDisplay.textContent = `HP: ${this.mainCharacter.currentHP}/${this.mainCharacter.maxHP}`;
                    if( this.donutsDisplay!=null) this.donutsDisplay.textContent = `donuts: ${this.donutsFound}/5`;
                    const pos = this.mainCharacter.collisionMesh.position;
                    if(this.positionDisplay!=null) this.positionDisplay.textContent = `Position: (x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)})`;
                    //if(this.finishDisplay!=null && this.boss!=null && this.boss.hp>0) this.finishDisplay.textContent = ``;

                    if (!this.mainCharacter.isAlive || this.levelFinished) return;


                    let moveDirection = new Vector3(0, 0, 0);
                    // Determine movement direction
                    if (keys["forward"]) moveDirection.z -= 1;
                    if (keys["backward"]) moveDirection.z += 1;
                    if (keys["left"]) moveDirection.x -= 1;
                    if (keys["right"]) moveDirection.x += 1;
                    this.mainCharacter.attack(this.isAttacking);
                    // Mettre à jour le recul du personnage
                    this.mainCharacter.updateHit();

                    moveDirection.normalize();
                    this.mainCharacter.move(moveDirection, this.boundary);
                    // Gravity
                    this.mainCharacter.applyGravity();
                    this.mainCharacter.applyGravity();

                    this.scene.render();
                });
    }
}
