import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh, Ray } from "@babylonjs/core";

export class Character {
    public mesh: Mesh;
    private scene: Scene;
    private speed: number = 0.1;
    private jumpStrength: number = 0.15;
    private gravity: number = -0.005;
    private velocityY: number = 0;
    private isJumping: boolean = false;
    private isCrawling: boolean = false;
    private canJump: boolean = true;
    private isGrabbing: boolean = false;
    
    constructor(scene: Scene, position: Vector3, color: Color3) {
        this.scene = scene;

        // Создание персонажа (сфера)
        this.mesh = MeshBuilder.CreateSphere("character", { diameter: 1.2 }, scene);
        this.mesh.position = position;
        this.mesh.checkCollisions = true;

        // Материал персонажа
        const material = new StandardMaterial("characterMat", scene);
        material.diffuseColor = color;
        this.mesh.material = material;
    }

    // Метод движения
    public move(direction: Vector3) {
        if (this.isCrawling) {
            direction.scaleInPlace(0.3); // Уменьшение скорости в режиме ползания
        }
        this.mesh.moveWithCollisions(direction.scale(this.speed));
    }

    // Метод прыжка
    public jump() {
        if (!this.isJumping && this.isGrounded() && this.canJump && !this.isCrawling) {
            this.velocityY = this.jumpStrength;
            this.isJumping = true;
            this.canJump = false;
            setTimeout(() => this.canJump = true, 1500); // Задержка перед следующим прыжком
        }
    }

    // Применение гравитации
    public applyGravity() {
        if (this.isJumping) {
            this.mesh.moveWithCollisions(new Vector3(0, this.velocityY, 0));
            this.velocityY += this.gravity;
            if (this.isGrounded()) {
                this.isJumping = false;
                this.velocityY = 0;
            }
        }
    }

    // Проверка, стоит ли персонаж на земле
    public isGrounded(): boolean {
        const ray = new Ray(this.mesh.position, new Vector3(0, -1, 0), 1.2);
        const hit = this.scene.pickWithRay(ray);
        return hit !== null && hit.pickedMesh !== null;
    }

    // Ползание
    public crawl(start: boolean) {
        this.isCrawling = start;
        if (start) {
            this.mesh.scaling.y = 0.5;
            this.mesh.position.y = 0.3;
            this.speed = 0.025;
            this.jumpStrength = 0.05;
        } else {
            this.mesh.scaling.y = 1;
            this.mesh.position.y = 0.6;
            this.speed = 0.1;
            this.jumpStrength = 0.15;
        }
    }

    // Взаимодействие с объектами (захват)
    public grabObject(start: boolean) {
        this.isGrabbing = start;
    }
}
