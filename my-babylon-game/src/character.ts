import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh, Ray } from "@babylonjs/core";

export default class Character {
    public mesh: Mesh;
    private scene: Scene;
    public speed: number = 0.1;
    public jumpStrength: number = 0.3;
    public gravity: number = -0.005;
    public velocityY: number = 0;
    public isJumping: boolean = false;
    public isCrawling: boolean = false;
    public canJump: boolean = true;
    public isGrabbing: boolean = false;

    constructor(scene: Scene, position: Vector3, color: Color3) {
        this.scene = scene;

        // Create character (sphere)
        this.mesh = MeshBuilder.CreateSphere("character", { diameter: 1.2 }, scene);
        this.mesh.position = position;
        this.mesh.checkCollisions = true;
        this.mesh.showBoundingBox = true;

        // Character material
        const material = new StandardMaterial("characterMat", scene);
        material.diffuseColor = color;
        this.mesh.material = material;
    }

    // Movement method
    public move(direction: Vector3, _boundary: number) {
        if (this.isCrawling) {
            direction.scaleInPlace(0.3); // Reduce speed while crawling
        }
        this.mesh.moveWithCollisions(direction.scale(this.speed));
        
        // Check for step-down when moving
        this.checkForStepDown();
    }

    // Jump method
    public jump() {
        if (this.canJump) {
            this.velocityY = this.jumpStrength;
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
            this.mesh.position.y = 0.3;
            this.jumpStrength = 0.05;
        } else {
            this.mesh.scaling.y = 1;
            this.mesh.position.y = 0.6;
            this.jumpStrength = 0.15;
        }
    }

    // Interaction with objects (grabbing)
    public grabObject(start: boolean) {
        this.isGrabbing = start;
    }
}
