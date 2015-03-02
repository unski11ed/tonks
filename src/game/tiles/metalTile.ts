import { Texture } from "../texture";
import { Entity } from "../entity";
import { EntityManager } from "../entityManager";

export class MetalTile extends Entity {
    constructor (texture: Texture) {
        super(24, 0, 8, 8, texture);

        this.groupId = "Tile";
    }

    public testCollision(): Entity | null {
        return null;
    }

    public static create(entityManager: EntityManager): MetalTile {
        const metalTile = new MetalTile(entityManager.texture);
        
        metalTile.onDied(() => entityManager.removeEntity(metalTile));
        entityManager.addEntity(metalTile);

        return metalTile;
    }
}
