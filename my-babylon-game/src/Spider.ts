import { Scene, Vector3, MeshBuilder, StandardMaterial, Quaternion, BoundingInfo, Mesh } from "@babylonjs/core";
import { GameObject } from "./GameObject";
import Character from "./character";

export class Spider extends GameObject {
    private speed: number;
    public collisionCube: Mesh | null = null;

    constructor(scene: Scene, modelPath: string, fileName: string, position: Vector3, scale: Vector3, speed: number = 0.1) {
        super(scene, modelPath, fileName, position, scale, (mesh) => {
            // Paramètres supplémentaires pour l'araignée
            const min = new Vector3(-0.25, -0.25, -0.4);
            const max = new Vector3(0.25, 0.25, 0.4);
            mesh.setBoundingInfo(new BoundingInfo(min, max));
            //mesh.showBoundingBox = true;

            // Création du cube de collision pour l'araignée avec les mêmes dimensions que la BoundingInfo
            this.createCollisionCube(scene, position, scale, min, max);
            if(this.collisionCube!=null)this.collisionCube.showBoundingBox = true;

        });
        this.speed = speed;
    }

    // Méthode pour créer un cube de collision pour l'araignée avec les mêmes dimensions que la BoundingInfo
    private createCollisionCube(scene: Scene, position: Vector3, scale: Vector3, min: Vector3, max: Vector3) {
        // Calcul des dimensions du cube de collision en fonction des min et max de la BoundingInfo
        const size = max.subtract(min);

        // Créer un cube avec les dimensions appropriées
        this.collisionCube = MeshBuilder.CreateBox("spiderCollisionCube", {
            width: size.x,
            height: size.y,
            depth: size.z
        }, scene);

        // Appliquer la position et l'échelle
        this.collisionCube.position = position;
        this.collisionCube.scaling = scale;

        // Rendre le cube invisible en appliquant un matériau transparent
        const material = new StandardMaterial("collisionMaterial", scene);
        material.alpha = 0; // Rendre le cube totalement transparent
        this.collisionCube.material = material;

        // Configurer le cube pour qu'il participe à la détection des collisions
        this.collisionCube.checkCollisions = true;
    }

    // Méthode pour déplacer l'araignée vers le personnage
    public crawl(target: Character) {
        if (!this.mesh) {
            return; // Si le mesh n'est pas encore chargé, on arrête la méthode
        }
        if (!target.mesh) {
            return; // Si le personnage n'est pas encore chargé, on arrête également
        }

        // Calculer la direction vers le personnage
        const directionToTarget = target.mesh!.position.subtract(this.mesh!.position).normalize();

        // Calculer la distance entre l'araignée et le personnage
        const distanceToTarget = this.mesh!.position.subtract(target.mesh!.position).length();

        // Seuil de distance pour arrêter le mouvement
        const stoppingDistance = 2;

        if (distanceToTarget > stoppingDistance) {
            // Si la distance est suffisamment grande, l'araignée continue de se déplacer
            const moveVector = new Vector3(directionToTarget.x * this.speed, 0, directionToTarget.z * this.speed);
            this.move(moveVector);

            // Mettre à jour la position du cube de collision pour qu'il suive l'araignée
            if (this.collisionCube) {
                this.collisionCube.position = this.mesh!.position;
            }

            // Calculer l'angle pour orienter l'araignée vers le personnage
            const angle = Math.atan2(directionToTarget.x, directionToTarget.z); // Correction de l'orientation
            // Appliquer la rotation sous forme de quaternion pour une meilleure précision
            this.mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, angle, 0);
            if (this.collisionCube) {
                this.collisionCube.rotationQuaternion = Quaternion.FromEulerAngles(0, angle, 0);
            }
            if (this.collisionCube) {
                this.collisionCube.rotation.y = angle; // Tourner le cube de collision
            }
        } else {
            // Si l'araignée est suffisamment proche du personnage, elle s'arrête
            // (elle ne bouge plus et peut éventuellement changer d'état ou autre comportement)
        }
    }


}
