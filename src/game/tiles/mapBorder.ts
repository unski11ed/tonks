import { Entity } from '../entity';
import { Texture } from '../texture';
import { EntityManager } from '../entityManager';

export class MapBorder extends Entity {
    constructor (
        x: number,
        y: number,
        width: number,
        height: number,
        texture: Texture
    ) {
        super(0, 0, 0, 0, texture);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.groupId = "Border";
    }

    // No ops
    public render() { }
    public update() { }
    public die() { }

    public static create(entityManager: EntityManager): MapBorder[] {
        const {
            texture,
            screenHeight,
            screenWidth
        } = entityManager;

        const leftBorder = new MapBorder(-50, 0, 50, 500, texture);
        const rightBorder = new MapBorder(screenWidth, 0, 50, 500, texture);
        const topBorder = new MapBorder(0, -50, 500, 50, texture);
        const bottomBorder = new MapBorder(0, screenHeight, 500, 50, texture);

        entityManager.addEntity(leftBorder);
        entityManager.addEntity(rightBorder);
        entityManager.addEntity(topBorder);
        entityManager.addEntity(bottomBorder);

        return [leftBorder, rightBorder, topBorder, bottomBorder];
    }
}
