import { Entity } from "./../entity";
import { Texture } from "./../texture";
import { Bullet } from "../actors/bullet";
import { EntityManager } from "../entityManager";

export class ConcreteTile extends Entity {
    constructor (texture: Texture) {
        super(8, 0, 8, 8, texture);
        this.groupId = "Tile";
    }

    public testCollision(entity: Entity): Entity | null {
        var e = super.testCollision(entity);
        if (e != null && entity instanceof Bullet) {
            var bullet = <Bullet>entity;
            if (bullet.superBullet)
                this.die();
        }
        return e;
    }

    public static create(entityManager: EntityManager): ConcreteTile {
        const concreteTile = new ConcreteTile(entityManager.texture);
        
        concreteTile.onDied(() => entityManager.removeEntity(concreteTile));
        entityManager.addEntity(concreteTile);

        return concreteTile;
    }
}