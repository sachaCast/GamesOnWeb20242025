import { Scene, Texture, Engine, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, SceneLoader, Mesh, Camera, FollowCamera, TransformNode, Tools } from "@babylonjs/core";
import "@babylonjs/loaders";
import Character from "./character";
//import { GameObject } from "./GameObject";
import { CSG } from "@babylonjs/core/Meshes/csg";
import { BoundingBox } from "@babylonjs/core/Culling/boundingBox";
import { Spider } from "./Spider";

export default class TestLevel {
    public scene: Scene;
    private groundSize: number = 20;
    public ground: any;
    //public cube: any;
    //public donuts: GameObject[] = []; // USE GameObject INSTEAD OF Mesh[]
    public spiders: Spider[] = []; // USE GameObject INSTEAD OF Mesh[]
    public canvas: HTMLCanvasElement;
    public engine: Engine;
    public boundary = this.groundSize / 2 - 1; // Character movement boundaries
    public isAttacking = false;
    private healthDisplay: HTMLElement;
    //private initialCharacterPosition: Vector3 = new Vector3(0, 0.6, 0);
    private positionDisplay: HTMLElement;


    constructor() {
        //this.mainCharacter = mainCharacter;
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.createLighting();
        this.createGround();
        this.loadLevel();
        //this.scene.collisionsEnabled = true;
        //this.createCube();
        //this.loadDonuts();
        this.createBorders();
        this.loadSpiders();
        this.healthDisplay = document.getElementById("healthDisplay")!;
        this.positionDisplay = document.getElementById("positionDisplay")!;
        this.scene.collisionsEnabled = true;

        
    }

    public resetLevel() {
        this.scene.dispose();
        this.scene = new Scene(this.engine);
        this.spiders = [];
        //this.donuts = [];
        this.createLighting();
        this.createGround();
        this.loadLevel();
        //this.scene.collisionsEnabled = true;
        //this.createCube();
        //this.loadDonuts();
        this.createBorders();
        this.loadSpiders();
        this.healthDisplay = document.getElementById("healthDisplay")!;
        this.scene.collisionsEnabled = true;

    }

    private createLighting() {
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
    }

    private createGround() {
        this.ground = MeshBuilder.CreateGround("ground", { width: this.groundSize*2, height: this.groundSize }, this.scene);
        //this.ground.position = new Vector3(-39.99, -7.99, 0.18);
        this.ground.position.x = this.groundSize-30;
        const groundMaterial = new StandardMaterial("groundMat", this.scene);
        const groundTexture = new Texture("/textures/scratched-old-rotten-wood_spec_1k.jpg", this.scene);
        groundMaterial.diffuseTexture = groundTexture;
        this.ground.material = groundMaterial;
        this.ground.checkCollisions = true;
    }

  
    /*private loadLevel(): void {
        SceneLoader.LoadAssetContainer("/", "level1.glb", this.scene, (container) => {
                const levelRoot = new TransformNode("levelRoot", this.scene);
    
                // Parent all imported meshes to a root node
                container.meshes.forEach(mesh => {
                    mesh.parent = levelRoot;
                    mesh.checkCollisions = true; 
                    //mesh.scaling = new Vector3(1, 1, 1);
                    //mesh.receiveShadows = true;
                    //mesh.scaling.x = -1;
                    //mesh.scaling.y = -1;
                    //mesh.scaling.z = -1;
                });
    
                // Move entire level to desired position
                levelRoot.position = new Vector3(-47, -10.50, 0);
                //levelRoot.rotation.y = Math.PI / 2;
                //levelRoot.rotation = new Vector3(0, Tools.ToRadians(90), 0);

                const invisibleGround = MeshBuilder.CreateGround("invisibleGround", {
                    width: 100,
                    height: 100,
                }, this.scene);
        
                invisibleGround.position = new Vector3(-47, -10.5, 0);
                invisibleGround.visibility = 0;
                invisibleGround.checkCollisions = true;
                invisibleGround.isPickable = false;
                invisibleGround.freezeWorldMatrix();
                container.addAllToScene();
            }
        );
    }*/
    private loadLevel(): void {
        SceneLoader.ImportMesh(null, "/", "level1.glb", this.scene, (meshes) => {
            console.log("Level loaded!", meshes);

            meshes.forEach(mesh => {
              mesh.checkCollisions = true;
              mesh.receiveShadows = true; 
            });
            meshes[0].position = new Vector3(-50.5, -10.50, 0);
            meshes[0].rotation = new Vector3(0, Tools.ToRadians(-90), 0);

            /*Add invisible ground under the model !!!!!!!!! IF WE NEED IT !!!!!!!
            const invisibleGround = MeshBuilder.CreateGround("invisibleGround", {
                width: 200,
                height: 200
            }, this.scene);

            invisibleGround.position = new Vector3(-50.5, -10.51, 0); // Just below the level
            invisibleGround.isVisible = false; // Make it invisible
            invisibleGround.checkCollisions = true; // Enable collision*/

        });
    }     
    
    
    
    /*private createCube() {
        this.cube = MeshBuilder.CreateBox("pushableCube", { size: 1 }, this.scene);
        this.cube.position = new Vector3(3, 0.5, 3);
        const cubeMaterial = new StandardMaterial("cubeMat", this.scene);
        cubeMaterial.diffuseColor = Color3.Blue();
        this.cube.material = cubeMaterial;
        this.cube.checkCollisions = true;
    }*/

    /*private loadDonuts() {
        const donutPositions = [
            new Vector3(5, 1.3, 0),
            new Vector3(-5, 1.3, 0),
            new Vector3(0, 1.3, 5),
        ];

        donutPositions.forEach((pos, index) => {
            const donut = new GameObject(this.scene, "/", "donut.glb", pos, new Vector3(5, 5, 5));
            this.donuts.push(donut);
        });

        console.log("Donuts are being loaded...");
    }*/

    private loadSpiders(){
        const spidersPositions = [
            new Vector3(-10, 0, 0),
            new Vector3(-15, 0, 0),
        ];
        spidersPositions.forEach((pos, index) => {
            let spider = new Spider(this.scene, "/", "spider.glb", pos, new Vector3(5, 5, 5));
            this.spiders.push(spider);
        });

    }

    checkBoundaries(object: any){
        if (object.position.x > this.boundary) object.position.x = this.boundary;
        //if (object.position.x < -this.boundary) object.position.x = -this.boundary;
        if (object.position.z > this.boundary) object.position.z = this.boundary;
        if (object.position.z < -this.boundary) object.position.z = -this.boundary;
    }

    private checkCollisionWithSpiders(mainCharacter: Character,bounceForce: number) {
        if (!mainCharacter.isAlive) return;
        const spidersToCheck = [...this.spiders];

        spidersToCheck.forEach(spider => {
            if (spider.collisionCube) {
                const distance = Vector3.Distance(mainCharacter.mesh.position, spider.collisionCube.position);
                //const distanceCube = Vector3.Distance(this.cube.position, spider.collisionCube.position);

                if (distance < 2) { // Collision threshold
                    // Calculer la direction du coup (de l'araignée vers le personnage)
                    const direction = mainCharacter.mesh.position.subtract(spider.collisionCube.position).normalize();

                    // Appliquer le recul au personnage
                    mainCharacter.getHit(direction);

                    // Appliquer aussi le petit bounce existant
                    mainCharacter.mesh.position.x += direction.x * bounceForce;
                    mainCharacter.mesh.position.z += direction.z * bounceForce;
                }

                /*if ((distanceCube < 2 && !mainCharacter.isGrabbing)) { // Collision threshold
                    const direction = mainCharacter.mesh.position.subtract(spider.collisionCube.position).normalize();
                    //this.cube.position.x += direction.x * bounceForce;
                    //this.cube.position.z += direction.z * bounceForce;
                }
                if ((distance < 2 && mainCharacter.isGrabbing) || (distanceCube < 2 && mainCharacter.isGrabbing)) { // Collision threshold
                    const direction = mainCharacter.mesh.position.subtract(spider.collisionCube.position).normalize();
                    mainCharacter.mesh.position.x += direction.x * bounceForce;
                    mainCharacter.mesh.position.z += direction.z * bounceForce;
                    //this.cube.position.x += direction.x * bounceForce;
                    //this.cube.position.z += direction.z * bounceForce;
                }*/
            }
        });
    }

    /*private checkCollisionWithDonuts(mainCharacter: Character,bounceForce: number) {
        this.donuts.forEach(donut => {
            if (donut.mesh) {
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
    }*/

    starting(mainCharacter: Character) : Character{
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
            "KeyC": "grab",
        };

        this.scene.onPointerDown = (evt, pickInfo) => {
            if (evt.button === 0) { // Clic gauche
                this.isAttacking = true;
                console.log("Attaque avec clic gauche !");

                // Vérifier la collision PHYSIQUE entre attackCube et les araignées
                this.spiders.forEach(spider => {
                    if (spider.collisionCube && mainCharacter.attackCube) {
                        const spiderBox = spider.collisionCube.getBoundingInfo().boundingBox;
                        const attackBox = mainCharacter.attackCube.getBoundingInfo().boundingBox;

                        if (BoundingBox.Intersects(spiderBox, attackBox)) {
                            // Calculer la direction du coup (du personnage vers l'araignée)
                            const direction = spider.collisionCube.position.subtract(mainCharacter.mesh.position).normalize();

                            // Infliger des dégâts avec la direction
                            spider.getHit(direction);

                            console.log("Araignée touchée ! HP restant :", spider.hp);

                            if (spider.hp <= 0) {
                                spider.mesh?.dispose();
                                spider.collisionCube?.dispose();
                                const index = this.spiders.indexOf(spider);
                                if (index !== -1) {
                                    this.spiders.splice(index, 1);
                                }
                            }
                        }
                    }
                });
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
            this.healthDisplay.textContent = `HP: ${mainCharacter.currentHP}/${mainCharacter.maxHP}`;
            if (!mainCharacter.isAlive) return;

            let moveDirection = new Vector3(0, 0, 0);
            // Determine movement direction
            if (keys["forward"]) moveDirection.z -= 1;
            if (keys["backward"]) moveDirection.z += 1;
            if (keys["left"]) moveDirection.x -= 1;
            if (keys["right"]) moveDirection.x += 1;
            mainCharacter.attack(this.isAttacking);
            // Mettre à jour le recul du personnage
            mainCharacter.updateHit();

            moveDirection.normalize();
            mainCharacter.move(moveDirection, this.boundary);
            // Gravity
            mainCharacter.applyGravity();
            mainCharacter.applyGravity();
            //mainCharacter.applyGravity();

            // Check for collisions with any of the donuts
            //this.checkCollisionWithDonuts(mainCharacter,bounceForce);
            this.spiders.forEach(spider => {
                spider.crawl(mainCharacter);
                spider.update(); // Ajoutez cette ligne
            });
            this.checkBoundaries(mainCharacter.mesh);
            this.checkCollisionWithSpiders(mainCharacter,bounceForce);


            const pos = mainCharacter.mesh.position;
            this.positionDisplay.textContent = `Position: (x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)})`;


            /*const cubeDistance = Vector3.Distance(mainCharacter.mesh.position, this.cube.position);
            if (cubeDistance < 1.5 && mainCharacter.isGrabbing) {
                mainCharacter.speed = 0.025;
                //this.cube.moveWithCollisions(moveDirection.scale(mainCharacter.speed));
                //this.cube.position.y = this.cube.scaling.y * 0.5;
                //this.checkBoundaries(this.cube);
            }
            else if (cubeDistance > 1.5){
                mainCharacter.speed = 0.1;
            }*/

            this.scene.render();
        });
        return mainCharacter;
    }


    private createBorders() {
        const wallMaterial = new StandardMaterial("wallMat", this.scene);
        //wallMaterial.diffuseColor = new Color3(0.6, 0.6, 0.6); // Gray walls
        const wallTexture = new Texture("/textures/old-lime-plaster_spec_1k.jpg", this.scene); 
        wallMaterial.diffuseTexture = wallTexture;

        // Optional: tile the texture to avoid stretching
        wallTexture.uScale = 4;
        wallTexture.vScale = 4;

        const wallHeight = 10;
        const wallThickness = 0.2;
        const doorWidth = 4; // 1.5x wider door
        const doorHeight = 4; // Half the height

        // Keep the existing left & right walls
        const leftWall = MeshBuilder.CreateBox("leftWall", { width: wallThickness, height: wallHeight, depth: this.groundSize }, this.scene);
        leftWall.position.x = -this.groundSize * 1.5;
        leftWall.position.y = wallHeight / 2;
        leftWall.material = wallMaterial;
        leftWall.checkCollisions = true;

        // **Create Doorway (A Box that Cuts Through the Wall)**
        const doorMesh = MeshBuilder.CreateBox("door", { width: wallThickness + 0.1, height: doorHeight, depth: doorWidth }, this.scene);
        doorMesh.position.x = leftWall.position.x; // Align with left wall
        doorMesh.position.y = doorHeight / 2; // Center door height-wise
        doorMesh.position.z = 0; // Place in the middle of the wall
        doorMesh.isVisible = false; // Hide the cutter box

        // **Perform Boolean Subtraction to Create the Doorway**
        const leftWallCSG = CSG.FromMesh(leftWall);
        const doorCSG = CSG.FromMesh(doorMesh);
        const finalWallCSG = leftWallCSG.subtract(doorCSG); // Subtract door from wall

        // **Create the Final Left Wall with a Door Opening**
        const leftWallWithDoor = finalWallCSG.toMesh("leftWallWithDoor", wallMaterial, this.scene);
        leftWallWithDoor.checkCollisions = true;

        // **Dispose of Temporary Meshes**
        leftWall.dispose();
        doorMesh.dispose();

        const rightWall = MeshBuilder.CreateBox("rightWall", { width: wallThickness, height: wallHeight, depth: this.groundSize }, this.scene);
        rightWall.position.x = this.groundSize * 0.5;
        rightWall.position.y = wallHeight / 2;
        rightWall.material = wallMaterial;
        rightWall.checkCollisions = true;

        // **Fix the back wall size & position**
        const backWallWidth = rightWall.position.x - leftWall.position.x; // Match exact distance
        const backWall = MeshBuilder.CreateBox("backWall", { width: backWallWidth, height: wallHeight, depth: wallThickness }, this.scene);
        backWall.position.x = (rightWall.position.x + leftWall.position.x) / 2; // Center between walls
        backWall.position.z = -this.groundSize / 2;
        backWall.position.y = wallHeight / 2;
        backWall.material = wallMaterial;
        backWall.checkCollisions = true;

        // **Create Stairs Descending from the Door**
        this.createStairs(leftWallWithDoor.position.x - 0.5, doorWidth);
    }


    private createStairs(xPos: number, width: number) {
        const stairMaterial = new StandardMaterial("stairMat", this.scene);
        stairMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8); // Light gray

        const stairDepth = width;
        const stairWidth = 1; // Thickness of each step
        const stairHeight = 1;
        const stairCount = 10; // Number of steps

        for (let i = 0; i < stairCount; i++) {
            const step = MeshBuilder.CreateBox(`stair${i}`, { width: stairWidth, height: stairHeight, depth: stairDepth }, this.scene);
            step.position.x = xPos - stairWidth * i; // Move steps further from the door
            step.position.y = stairHeight * (stairCount - i - 10.5); // Lower each step
            step.position.z = 0; // Center with door
            step.material = stairMaterial;
            step.checkCollisions = true;
        }

    }



}
