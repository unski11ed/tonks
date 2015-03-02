import { Entity } from "../entity";
import { Texture } from "../texture";
import { EntityManager } from "../entityManager";

export class BushTile extends Entity {
    constructor (texture: Texture){
        super(16, 0, 8, 8, texture);
        this.zIndex = 3;
        this.groupId = "Tile";
    }

    public testCollision(): Entity | null {
        return null;
    }

    public static create(entityManager: EntityManager): BushTile {
        const bushTile = new BushTile(entityManager.texture);
        
        bushTile.onDied(() => entityManager.removeEntity(bushTile));
        entityManager.addEntity(bushTile);

        return bushTile;
    }
}