import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh, Ray } from "@babylonjs/core";
import { GameObject } from "./GameObject";
import TestLevel from "./TestLevel";

export default class Character {
    public mesh: Mesh;
    private scene: Scene;
    public speed: number = 0.1;
    //public jumpStrength: number = 0.3;
    public jumpStrength: number = 0;
    public defaultJumpStrength: number = 0.3;
    public gravity: number = -0.005;
    public velocityY: number = 0;
    public isJumping: boolean = false;
    public isCrawling: boolean = false;
    public canJump: boolean = true;
    public isGrabbing: boolean = false;
    public attackCube: Mesh | null = null;
    private isHit: boolean = false;
    private hitDirection: Vector3 = Vector3.Zero();
    private hitTimer: number = 0;
    private readonly hitDuration: number = 10; // Durée du recul en frames
    private readonly hitBounceForce: number = 0.3; // Force du recul
    public maxHP: number = 10;
    public currentHP: number = 10;
    public isAlive: boolean = true;
    private initialPosition: Vector3;
    private level: TestLevel;

    constructor(scene: Scene, position: Vector3, color: Color3,level: TestLevel) {
        this.level = level;
        this.scene = scene;
        this.initialPosition = position.clone();
        // Create character (sphere)
        this.mesh = MeshBuilder.CreateSphere("character", { diameter: 1.2 }, scene);
        this.mesh.position = position;
        this.mesh.checkCollisions = true;
        this.mesh.showBoundingBox = true;

        // Character material
        const material = new StandardMaterial("characterMat", scene);
        material.diffuseColor = color;
        this.mesh.material = material;
        this.createAattackCUbe();
    }

    // Movement method
    public move(direction: Vector3, _boundary: number) {
        if (this.isCrawling) {
            direction.scaleInPlace(0.3); // Reduce speed while crawling
            this.mesh.position.y = 0.2;
        }
        this.mesh.moveWithCollisions(direction.scale(this.speed));
        // Make the attackCube move with the character
        if (this.attackCube) {
            this.attackCube.position = this.mesh.position.clone(); // Sync position of the cube with the character
        }
        // Check for step-down when moving
        this.checkForStepDown();
    }

    // Jump method
    public jump() {
        if (this.canJump) {
            this.velocityY = this.defaultJumpStrength;
            this.isJumping = true;
            this.canJump = false;
            setTimeout(() => this.canJump = true, 500); // Delay before the next jump
        }
    }

    // Apply gravity
    public applyGravity() {
        if (this.isJumping) {
            this.mesh.moveWithCollisions(new Vector3(0, this.velocityY, 0));
            this.velocityY += this.gravity;
            //if (this.mesh.position.y <= -6) {
                // character.position.y = 0.6;
                // this.isJumping = false;
                //this.velocityY = 0;
            //}
        }
    }

    // Check if the character is on the ground
    public isGrounded(): boolean {
        const ray = new Ray(this.mesh.position, new Vector3(0, -1, 0), 1.2); // Reduced radius
        const hit = this.scene.pickWithRay(ray);
        return hit !== null && hit.pickedMesh !== null;
    }

    // New method: checks if the character should move down (for steps)
    private checkForStepDown() {
        const ray = new Ray(this.mesh.position, new Vector3(0, -1, 0), 1.5);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedMesh) {
            let stepHeight = hit.pickedPoint ? hit.pickedPoint.y : 0;
            let heightDifference = this.mesh.position.y - stepHeight;

            // If the height difference is greater than 0.2, it means there's a step, and the character should move down
            if (heightDifference > 0.2) {
                this.mesh.moveWithCollisions(new Vector3(0, -0.3, 0)); // Smooth downward movement
            }
        }
    }

    // Crawling method
    public crawl(start: boolean) {
        this.isCrawling = start;
        if (start) {
            this.mesh.scaling.y = 0.5;
            this.isJumping = true;
            this.canJump = true;
            this.jumpStrength = this.defaultJumpStrength * 0.5;
        }
        if (!start) {
            this.mesh.scaling.y = 1;
            this.mesh.position.y = 0.6;
            this.jumpStrength = this.defaultJumpStrength;
        }
    }

    // Interaction with objects (grabbing)
    public grabObject(start: boolean) {
        this.isGrabbing = start;
    }

    // Attack method: creates a red transparent cube around the character
    public createAattackCUbe() {
        // Create the cube around the character
        this.attackCube = MeshBuilder.CreateBox("attackCube", { size: 2.5 }, this.scene);
        this.attackCube.position = this.mesh.position.clone();

        // Create a material for the cube
        const attackMaterial = new StandardMaterial("attackMaterial", this.scene);
        attackMaterial.diffuseColor = Color3.Red();
        attackMaterial.alpha = 0;
        this.attackCube.material = attackMaterial;
    }

    public attack(isAttacking: boolean){
        if (this.attackCube && this.attackCube.material) {
            if(isAttacking){
                this.attackCube.material.alpha = 0.2;
            }
            else{
                this.attackCube.material.alpha = 0;
            }
        }

    }

    public getHit(direction: Vector3) {
        if (!this.isAlive) return;
        this.currentHP -= 1; // Perd 1 HP
        console.log(`Player hit! HP remaining: ${this.currentHP}/${this.maxHP}`);

        // Appliquer le recul
        this.isHit = true;
        this.hitTimer = this.hitDuration;
        this.hitDirection = new Vector3(direction.x, 0, direction.z).normalize();

        if (this.currentHP <= 0) {
            this.die();
        }
    }

    public die() {
        this.isAlive = false;
        console.log("Player died!");
        // Désactiver le mesh temporairement
        this.mesh.setEnabled(false);
        if (this.attackCube) this.attackCube.setEnabled(false);

        // Respawn après un délai
        setTimeout(() => {
            this.level.resetLevel();
            this.respawn();
        }, 2000);
    }

    public respawn() {
        this.level.resetLevel();
        const newCharacter = new Character(this.level.scene, this.initialPosition, Color3.Red(), this.level);
        this.level.starting(newCharacter);
    }

    public updateHit() {
        if (this.isHit && this.hitTimer > 0) {
            // Appliquer le recul seulement sur X/Z
            this.mesh.position.x += this.hitDirection.x * this.hitBounceForce;
            this.mesh.position.z += this.hitDirection.z * this.hitBounceForce;

            if (this.attackCube) {
                this.attackCube.position.x = this.mesh.position.x;
                this.attackCube.position.z = this.mesh.position.z;
            }

            this.hitTimer--;
        } else {
            this.isHit = false;
        }
    }
}
