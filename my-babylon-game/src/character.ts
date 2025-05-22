import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh, Ray, SceneLoader, AbstractMesh, TransformNode, AnimationGroup } from "@babylonjs/core";
import TestLevel from "./TestLevel";

export default class Character {
    public mesh: TransformNode; // Root node for the character model
    private scene: Scene;
    public speed: number = 0.1;
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
    private readonly hitDuration: number = 10; // Duration of knockback in frames
    private readonly hitBounceForce: number = 0.3; // Knockback force
    public maxHP: number = 10;
    public currentHP: number = 10;
    public isAlive: boolean = true;
    private initialPosition: Vector3;
    private level: TestLevel;
    public collisionMesh: Mesh; // Invisible mesh for collisions
    private animationGroups: { [key: string]: AnimationGroup } = {};
    private currentAnimation: AnimationGroup | null = null;
    private currentActionState: string = "staying";
    private isPlayingNonLooping: boolean = false;

    constructor(scene: Scene, position: Vector3, level: TestLevel) {
        this.level = level;
        this.scene = scene;
        this.initialPosition = position.clone();

        // Create an invisible collision mesh (box) for simplified collisions
        this.collisionMesh = MeshBuilder.CreateBox("characterCollision", { size: 1.2 }, scene);
        this.collisionMesh.position = position;
        this.collisionMesh.isVisible = false;
        this.collisionMesh.checkCollisions = true;
        this.collisionMesh.showBoundingBox = true;

        // Initialize a TransformNode as the root for the character model
        this.mesh = new TransformNode("characterRoot", scene);
        this.mesh.position = position;

        // Load the .glb model
        this.loadCharacterModel(position);

        this.createAttackCube();
    }

    private async loadCharacterModel(position: Vector3) {
        try {
            const result = await SceneLoader.ImportMeshAsync("", "/", "character.glb", this.scene);
            const rootMesh = result.meshes[0] as AbstractMesh;

            rootMesh.parent = this.mesh;
            rootMesh.position = Vector3.Zero();
            rootMesh.scaling = new Vector3(1, 1, 1);
            rootMesh.rotation = new Vector3(0, Math.PI * 1.5, 0);

            this.collisionMesh.ellipsoid = new Vector3(0.6, 1.2, 0.6);
            this.collisionMesh.ellipsoidOffset = new Vector3(0, 0.6, 0);

            result.animationGroups.forEach((group) => {
                this.animationGroups[group.name.toLowerCase()] = group;
                console.log(`Animation ${group.name}: ${group.to - group.from} frames`);
            });

            this.animationGroups["jump"].speedRatio = 2.7; // Slow down if too fast
            this.animationGroups["walking"].speedRatio = 1.3; // Adjust for natural walking pace
            //this.animationGroups["crouch"].speedRatio = 1.0;  // Adjust for natural crouching

            // Debug: Log available animations
            console.log("Available animations:", Object.keys(this.animationGroups));

            // Set staying as default animation
            this.setAnimation("staying");
            this.currentActionState = "staying";
        } catch (error) {
            console.error("Failed to load character model:", error);
            const fallbackMesh = MeshBuilder.CreateSphere("characterFallback", { diameter: 1.2 }, this.scene);
            fallbackMesh.parent = this.mesh;
            const material = new StandardMaterial("fallbackMat", this.scene);
            material.diffuseColor = Color3.White();
            fallbackMesh.material = material;
        }
    }

    private setAnimation(animationName: string, loop: boolean = true) {
        //const currentTime = performance.now();

        if (this.currentAnimation === this.animationGroups[animationName.toLowerCase()] && this.currentAnimation.isPlaying) {
            return;
        }

        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        const animation = this.animationGroups[animationName.toLowerCase()];
        if (animation) {
            console.log(`Playing animation: ${animationName}, Loop: ${loop}`);
            animation.play(loop);
            this.currentAnimation = animation;
            this.isPlayingNonLooping = !loop;
            this.currentActionState = animationName.toLowerCase();
            //this.lastAnimationStartTime = currentTime;

            // Add observer for non-looping animations to transition back to staying
            if (!loop) {
                animation.onAnimationEndObservable.addOnce(() => {
                    console.log(`Animation ${animationName} ended`);
                    this.isPlayingNonLooping = false;
                    if (this.currentActionState === animationName.toLowerCase()) {
                        this.setAnimation("staying");
                        this.currentActionState = "staying";
                    }
                });
            }
        } else {
            console.warn(`Animation ${animationName} not found`);
            this.setAnimation("staying"); // Fallback to staying
            this.currentActionState = "staying";
        }
    }

    public move(direction: Vector3, _boundary: number) {
        if (this.isPlayingNonLooping) {
            // Don't change animation during non-looping animations (e.g., jump, puch)
            this.collisionMesh.moveWithCollisions(direction.scale(this.speed));
            this.mesh.position = this.collisionMesh.position.clone();
            if (this.attackCube) {
                this.attackCube.position = this.mesh.position.clone();
            }
            this.checkForStepDown();
            return;
        }

        if (direction.length() > 0 && this.currentActionState !== "walking") {
            this.setAnimation("walking", false); // Play walking once
            this.currentActionState = "walking";
        } else if (direction.length() === 0 && this.currentActionState !== "staying" && !this.isPlayingNonLooping) {
            this.setAnimation("staying");
            this.currentActionState = "staying";
        }

        // Turning the character based on movement direction
        if (direction.x !== 0 || direction.z !== 0) {
            const angle = Math.atan2(-direction.x, -direction.z);
            this.mesh.rotation.y = angle + Math.PI * 1.5; // Adjust rotation
        }

        this.collisionMesh.moveWithCollisions(direction.scale(this.speed));
        this.mesh.position = this.collisionMesh.position.clone();
        if (this.attackCube) {
            this.attackCube.position = this.mesh.position.clone();
        }
        this.checkForStepDown();
    }

    // Jump method
    public jump() {
        if (this.canJump && !this.isPlayingNonLooping) {
            this.setAnimation("jump", false); // Start jump animation immediately
            this.currentActionState = "jump";
            this.velocityY = this.defaultJumpStrength;
            this.isJumping = true;
            this.canJump = false;
            setTimeout(() => (this.canJump = true), 500); // Reset jump ability after a delay
            console.log("Jump initiated, animation started");
        }
    }

    // Apply gravity
    public applyGravity() {
        if (this.isJumping) {
            this.collisionMesh.moveWithCollisions(new Vector3(0, this.velocityY, 0));
            this.mesh.position = this.collisionMesh.position.clone(); // Sync model
            this.velocityY += this.gravity;
            if (this.attackCube) {
                this.attackCube.position = this.mesh.position.clone();
            }
            // Reset to staying after jump when grounded
            if (this.isGrounded() && !this.isPlayingNonLooping) {
                this.isJumping = false;
                if (this.currentActionState !== "staying") {
                    this.setAnimation("staying");
                    this.currentActionState = "staying";
                }
            }
        }
    }

    // Check if the character is on the ground
    public isGrounded(): boolean {
        const ray = new Ray(this.collisionMesh.position, new Vector3(0, -1, 0), 999999);
        const hit = this.scene.pickWithRay(ray, (mesh) => {
            return mesh.isPickable && mesh.checkCollisions && mesh !== this.collisionMesh;
        });
        return hit !== null && hit.pickedMesh !== null;
    }

    // Check for step-down when moving
    private checkForStepDown() {
        const ray = new Ray(this.collisionMesh.position, new Vector3(0, -1, 0), 1.5);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedPoint) {
            let stepHeight = hit.pickedPoint.y;
            let heightDifference = this.collisionMesh.position.y - stepHeight;

            if (heightDifference > 0.2) {
                this.collisionMesh.moveWithCollisions(new Vector3(0, -0.3, 0));
                this.mesh.position = this.collisionMesh.position.clone();
                if (this.attackCube) {
                    this.attackCube.position = this.mesh.position.clone();
                }
            }
        }
    }

    // Crawling method
    public crawl(start: boolean) {
        if (this.isCrawling !== start) {
            //this.isCrawling = start;
            if (start) {
                //this.mesh.scaling.y = 0.5;
                this.collisionMesh.scaling.y = 0.5;
                this.collisionMesh.ellipsoid = new Vector3(0.6, 0.6, 0.6);
                this.collisionMesh.ellipsoidOffset = new Vector3(0, 0.3, 0);
                if (this.currentActionState !== "crouch") {
                    this.setAnimation("crouch", false); // Play crouch once
                    this.currentActionState = "crouch";
                }
            } else {
                this.mesh.scaling.y = 1;
                this.collisionMesh.scaling.y = 1;
                this.collisionMesh.ellipsoid = new Vector3(0.6, 1.2, 0.6);
                this.collisionMesh.ellipsoidOffset = new Vector3(0, 0.6, 0);
                if (this.currentActionState !== "staying" && !this.isPlayingNonLooping) {
                    this.setAnimation("staying");
                    this.currentActionState = "staying";
                }
            }
        }
    }

    // Interaction with objects (grabbing)
    public grabObject(start: boolean) {
        this.isGrabbing = start;
    }

    // Attack method: creates a red transparent cube around the character
    public createAttackCube() {
        this.attackCube = MeshBuilder.CreateBox("attackCube", { size: 2.5 }, this.scene);
        this.attackCube.position = this.mesh.position.clone();
        const attackMaterial = new StandardMaterial("attackMaterial", this.scene);
        attackMaterial.diffuseColor = Color3.Red();
        attackMaterial.alpha = 0;
        this.attackCube.material = attackMaterial;
    }

    public attack(isAttacking: boolean) {
        if (this.attackCube && this.attackCube.material) {
            if (isAttacking) {
                this.setAnimation("puch", false); // Fixed typo from "puch" to "puch", play once
                this.currentActionState = "puch";
                this.attackCube.material.alpha = 0.2;
            } else {
                if (this.currentActionState !== "staying" && !this.isPlayingNonLooping) {
                    this.setAnimation("staying");
                    this.currentActionState = "staying";
                }
                this.attackCube.material.alpha = 0;
            }
        }
    }

    public getHit(direction: Vector3) {
        if (!this.isAlive) return;
        this.currentHP -= 1;
        console.log(`Player hit! HP remaining: ${this.currentHP}/${this.maxHP}`);

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
        this.mesh.setEnabled(false);
        this.collisionMesh.setEnabled(false);
        if (this.attackCube) this.attackCube.setEnabled(false);

        setTimeout(() => {
            this.level.resetLevel();
            this.respawn();
        }, 2000);
    }

    public respawn() {
        this.level.resetLevel();
        const newCharacter = new Character(this.level.scene, this.initialPosition, this.level);
        this.level.starting(newCharacter);
    }

    public updateHit() {
        if (this.isHit && this.hitTimer > 0) {
            this.collisionMesh.position.x += this.hitDirection.x * this.hitBounceForce;
            this.collisionMesh.position.z += this.hitDirection.z * this.hitBounceForce;
            this.mesh.position = this.collisionMesh.position.clone();
            if (this.attackCube) {
                this.attackCube.position = this.mesh.position.clone();
            }
            this.hitTimer--;
        } else {
            this.isHit = false;
        }
    }
}