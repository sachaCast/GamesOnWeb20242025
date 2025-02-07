import { Scene, Texture, Engine, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, SceneLoader, Mesh, Camera, FollowCamera } from "@babylonjs/core";
import "@babylonjs/loaders";
import Character from "./character";
import { GameObject } from "./GameObject";

export default class TestLevel {
    public scene: Scene;
    private groundSize: number = 20;
    public ground: any;
    public cube: any;
    public donuts: GameObject[] = []; // Используем GameObject вместо Mesh[]
    public canvas: HTMLCanvasElement;
    public engine: Engine;
    public boundary = this.groundSize / 2 - 0.5; // Character movement boundaries

    //public keys;
    //public mainCharacter: MainCharacter;
    //public camera: Camera;

    constructor() {
        //this.mainCharacter = mainCharacter;
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.createLighting();
        this.createGround();
        this.createCube();
        this.loadDonuts();
    }

    private createLighting() {
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
    }

    private createGround() {
        this.ground = MeshBuilder.CreateGround("ground", { width: this.groundSize*2, height: this.groundSize }, this.scene);
        this.ground.position.x = this.groundSize-30;
        const groundMaterial = new StandardMaterial("groundMat", this.scene);
        const groundTexture = new Texture("./public/grass.jpg", this.scene);
        groundMaterial.diffuseTexture = groundTexture;
        this.ground.material = groundMaterial;
    }

    private createCube() {
        this.cube = MeshBuilder.CreateBox("pushableCube", { size: 1 }, this.scene);
        this.cube.position = new Vector3(3, 0.5, 3);
        const cubeMaterial = new StandardMaterial("cubeMat", this.scene);
        cubeMaterial.diffuseColor = Color3.Blue();
        this.cube.material = cubeMaterial;
        this.cube.checkCollisions = true;
    }

    private loadDonuts() {
        const donutPositions = [
            new Vector3(5, 1.3, 0),
            new Vector3(-5, 1.3, 0),
            new Vector3(0, 1.3, 5),
        ];

        donutPositions.forEach((pos, index) => {
            const donut = new GameObject(this.scene, "public/", "donut.glb", pos, new Vector3(5, 5, 5));
            this.donuts.push(donut);
        });

        console.log("Donuts are being loaded...");
    }

    checkBoundaries(object: any){
        if (object.position.x > this.boundary) object.position.x = this.boundary;
        //if (object.position.x < -this.boundary) object.position.x = -this.boundary;
        if (object.position.z > this.boundary) object.position.z = this.boundary;
        if (object.position.z < -this.boundary) object.position.z = -this.boundary;
    }

    starting(mainCharacter: Character){
        const bounceForce = 0.5;
        const camera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), this.scene);
        camera.lockedTarget = mainCharacter.mesh; // The camera follows the character
        camera.radius = 10;
        camera.heightOffset = 5;
        camera.rotationOffset = 0;
        // Disable user camera controls
        camera.inputs.clear();

        const keys: Record<string, boolean> = {}; // Store pressed keys

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
            "KeyC": "grab"
        };

        window.addEventListener("keydown", (event) => {
            const action = keyMappings[event.code];
            if (action) keys[action] = true;

            // Crawl mechanic
            if (event.code === "ShiftLeft") {
                mainCharacter.crawl(true);
            }

            if (event.code === "KeyC") {
                mainCharacter.isGrabbing = true;
            }

            if (event.code === "Space" && !mainCharacter.isJumping && mainCharacter.mesh.scaling.y === 1) {
                mainCharacter.velocityY = mainCharacter.jumpStrength;
                mainCharacter.isJumping = true;
            }

            if (event.code === "Space" && mainCharacter.isGrounded() && mainCharacter.canJump) {
                mainCharacter.jump();
            }
        });

        // Handle key release events
        window.addEventListener("keyup", (event) => {
            const action = keyMappings[event.code];
            if (action) keys[action] = false;

            // Restore normal size when shift is released
            if (event.code === "ShiftLeft") {
                mainCharacter.crawl(false);
            }

            if (event.code === "KeyC") {
                mainCharacter.isGrabbing = false;
            }
        });

        this.engine.runRenderLoop(() => {

            let moveDirection = new Vector3(0, 0, 0);
            this.checkBoundaries(mainCharacter.mesh);

            // Determine movement direction
            if (keys["forward"]) moveDirection.z -= 1;
            if (keys["backward"]) moveDirection.z += 1;
            if (keys["left"]) moveDirection.x -= 1;
            if (keys["right"]) moveDirection.x += 1;

            moveDirection.normalize();
            mainCharacter.move(moveDirection, this.boundary);
            // Gravity
            mainCharacter.applyGravity();

            // Check for collisions with any of the donuts
            this.donuts.forEach(donut => {
                if (donut.mesh) { // Проверяем, загружен ли пончик
                    const distance = Vector3.Distance(mainCharacter.mesh.position, donut.mesh.position);
                    const distanceCube = Vector3.Distance(this.cube.position, donut.mesh.position);

                    if (distance < 1 ) { // Collision threshold
                        const direction = mainCharacter.mesh.position.subtract(donut.mesh.position).normalize();
                        mainCharacter.mesh.position.x += direction.x * bounceForce;
                        mainCharacter.mesh.position.z += direction.z * bounceForce;
                    }
                    if ((distance < 1 && mainCharacter.isGrabbing) || distanceCube < 1) { // Collision threshold
                        const direction = mainCharacter.mesh.position.subtract(donut.mesh.position).normalize();
                        mainCharacter.mesh.position.x += direction.x * bounceForce;
                        mainCharacter.mesh.position.z += direction.z * bounceForce;
                        this.cube.position.x += direction.x * bounceForce;
                        this.cube.position.z += direction.z * bounceForce;
                    }
                }
            });

            const cubeDistance = Vector3.Distance(mainCharacter.mesh.position, this.cube.position);
            if (cubeDistance < 1.5 && mainCharacter.isGrabbing) {
                mainCharacter.speed = 0.025;
                this.cube.moveWithCollisions(moveDirection.scale(mainCharacter.speed));
                this.cube.position.y = this.cube.scaling.y * 0.5;
                this.checkBoundaries(this.cube);
            }
            else if (cubeDistance > 1.5){
                mainCharacter.speed = 0.1;
            }

            this.scene.render();
        });

    }
}
