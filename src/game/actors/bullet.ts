import { Angle } from './../angle';
import { Entity } from './../entity';
import { Texture } from './../texture';
import { CollisionHandler } from './../collisionHandler';
import { Actor } from '../actors/actor';

export class Bullet extends Entity {
    private _speed: number;

    public superBullet = false;

    constructor (
        texture: Texture,
        private _collisionHandler: CollisionHandler,
        private _owner: Actor,
        private _onBulletHit: (
            hitEntities: Entity[],
            hitPosition: {x: number, y: number}
        ) => void,
    ) {
        super(16, 8, 8, 8, texture);

        super.angle = _owner.angle;
        this.zIndex = 1;
        this._speed = _owner.cannon.bulletsSpeed;
        this.groupId = "Bullet";
    }

    public update() {
        switch (this.angle) {
            case Angle.North:
                this.y -= this._speed;
            break;
            case Angle.East:
                this.x += this._speed;
            break;
            case Angle.South:
                this.y += this._speed;
            break;
            case Angle.West:
                this.x -= this._speed;
            break;
        }
        const collidedObjects = this._collisionHandler.checkVerticalCollision(this);
        const collidedFiltered = collidedObjects.filter((colided) =>
            colided !== this._owner &&
            colided.groupId !== this.groupId &&
            colided.groupId !== this._owner.groupId
        );

        if (collidedFiltered.length > 0) {
            this.hitPoints--;
            this._onBulletHit(collidedFiltered, { x: this.x, y: this.y });
        }
    }

    public testCollision(entity: Entity): Entity | null {
        if(entity instanceof Bullet)
            return super.testCollision(entity);
        return null;
    }
}