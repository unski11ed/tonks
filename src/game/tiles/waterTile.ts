import { Entity } from "../entity";
import { Timer } from "../timer";
import { Texture } from "../texture";
import { Bullet } from "../actors/bullet";
import { EntityManager } from "../entityManager";

export class WaterTile extends Entity {
    private _delay: Timer = new Timer(700);
    private _frames = [{ x: 0, y: 8 }, { x: 8, y: 8}];
    private _currentFrame = 0;

    constructor(texture: Texture) {
        super(0, 8, 8, 8, texture);

        this.groupId = "Tile";
    }

    public update() {
        if (this._delay.interval()) {
            this._currentFrame++;
            if(this._currentFrame >= this._frames.length)
                this._currentFrame = 0;
            this.sourceX = this._frames[this._currentFrame].x;
            this.sourceY = this._frames[this._currentFrame].y;
        }
    }

    public testCollision(entity: Entity): Entity | null {
        if(entity instanceof Bullet)
            return null;
        return super.testCollision(entity);
    }

    public static create(entityManager: EntityManager): WaterTile {
        const waterTile = new WaterTile(entityManager.texture);
        
        waterTile.onDied(() => entityManager.removeEntity(waterTile));
        entityManager.addEntity(waterTile);

        return waterTile;
    }
}