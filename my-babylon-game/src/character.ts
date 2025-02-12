import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh, Ray, double } from "@babylonjs/core";

export default class Character {

    public mesh: Mesh;
    private scene: Scene;
    public speed: number = 0.1;
    public jumpStrength: number = 0.15;
    public gravity: number = -0.005;
    public velocityY: number = 0;
    public isJumping: boolean = false;
    public isCrawling: boolean = false;
    public canJump: boolean = true;
    public isGrabbing: boolean = false;

    constructor(scene: Scene, position: Vector3, color: Color3) {
        this.scene = scene;

        // Создание персонажа (сфера)
        this.mesh = MeshBuilder.CreateSphere("character", { diameter: 1.2 }, scene);
        this.mesh.position = position;
        this.mesh.checkCollisions = true;
        this.mesh.showBoundingBox = true;

        // Материал персонажа
        const material = new StandardMaterial("characterMat", scene);
        material.diffuseColor = color;
        this.mesh.material = material;
    }

    // Метод движения
    public move(direction: Vector3, boundary: double) {
        if (this.isCrawling) {
            direction.scaleInPlace(0.3); // Уменьшение скорости в режиме ползания
        }
        this.mesh.moveWithCollisions(direction.scale(this.speed));


    }

    // Метод прыжка
    public jump() {
        this.velocityY = this.jumpStrength;
        this.isJumping = true;
        this.canJump = false;
        setTimeout(() => this.canJump = true, 1500); // Задержка перед следующим прыжком à ameliorer
    }

    // Применение гравитации
    public applyGravity() {
        if (this.isJumping) {
            this.mesh.moveWithCollisions(new Vector3(0, this.velocityY, 0));
            this.velocityY += this.gravity;
            if (this.mesh.position.y <= 0.6) {
                //character.position.y = 0.6;
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
            this.jumpStrength = 0.05;
        } else {
            this.mesh.scaling.y = 1;
            this.mesh.position.y = 0.6;
            this.jumpStrength = 0.15;
        }
    }

    // Взаимодействие с объектами (захват)
    public grabObject(start: boolean) {
        this.isGrabbing = start;
    }
}
