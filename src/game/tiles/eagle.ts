import { Entity } from "../entity";
import { Texture } from "../texture";
import { EntityManager } from "../entityManager";
import { ExplosionFactory } from "../actors/explosionFactory";

export class Eagle extends Entity {
    public get isDestroyed() {
        return this._isDestroyed;
    }
    private _isDestroyed = false;

    constructor (texture: Texture) {
        super(0, 16, 16, 16, texture);
        this.x = 6 * this.width;
        this.y = 12 * this.height;

        this.groupId = "Eagle";
    }

    public die() {
        this._isDestroyed = true;
        this.sourceX = 16;
    }

    public static create(
        entityManager: EntityManager,
        explosionFactory: ExplosionFactory,
    ): Eagle {
        const eagle = new Eagle(entityManager.texture);
        
        eagle.onDied(() => {
            entityManager.removeEntity(eagle);
            explosionFactory.create({
                x: eagle.x + eagle.width / 2,
                y: eagle.y + eagle.height / 2,
            });
        });
        entityManager.addEntity(eagle);

        return eagle;
    }
}