import { Entity } from '../entity';
import { Texture } from '../texture';
import { Bullet } from './../actors/bullet';
import { Angle } from '../angle';
import { EntityManager } from '../entityManager';

export class WallTile extends Entity {
    private _verticalHP = 2;
    private _horizontalHP = 2;
    private _masks = new Array();

    constructor (texture: Texture) {
        super(0, 0, 8, 8, texture);
        this.hitPoints = 10000;
        this.groupId = "Tile";
    }

    public testCollision(entity: Entity): Entity | null {
        const output = super.testCollision(entity);
        if (output === this && entity instanceof Bullet) {
            var bullet = <Bullet>entity;

            if (bullet.angle == Angle.East || bullet.angle == Angle.West) {
                var mask = bullet.angle == 90 ?
                    { x: 0, y: 0, w: this.width / 2, h: this.height } :
                    { x: this.width / 2, y: 0, w: this.width / 2, h: this.height };
                
                this._masks.push(mask);
                this._horizontalHP--;
            } else {
                var mask = bullet.angle == 0 ?
                    { x: 0, y: this.height / 2, w: this.width, h: this.height / 2} :
                    { x: 0, y: 0, w: this.width, h: this.height / 2 };
                this._masks.push(mask);
                this._verticalHP--;
            }
            if(this._horizontalHP <= 0 || this._verticalHP <= 0 || bullet.superBullet)
                this.die();
        }
        return output;
    }

    public render(context: CanvasRenderingContext2D) {
        super.render(context);
        
        this._masks.forEach((mask) => {
            context.fillRect(this.x + mask.x, this.y + mask.y, mask.w, mask.h);
        });
    }

    public repair() {
        this._masks.splice(0, this._masks.length);
        this._verticalHP = this._horizontalHP = 2;
    }

    public static create(entityManager: EntityManager): Entity {
        const wallTile = new WallTile(entityManager.texture);
        
        wallTile.onDied(() => entityManager.removeEntity(wallTile));
        entityManager.addEntity(wallTile);

        return wallTile;
    }
}