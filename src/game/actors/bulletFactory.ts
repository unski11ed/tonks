import { EntityFactory } from './../entityFactory';
import { Bullet } from './bullet';
import { EntityManager } from './../entityManager';
import { CollisionHandler } from './../collisionHandler';
import { Actor } from './actor';
import { Entity } from './../entity';

export type BulletCreateParams = {
    owner: Actor,
    onHit: (hitEntities: Entity[], hitPosition: { x: number, y: number }) => void;
    onDestroyed: () => void;
};

export class BulletFactory implements EntityFactory<Bullet, BulletCreateParams> {
    constructor(
        private _entityManager: EntityManager,
        private _collisionHandler: CollisionHandler
    ) {}

    create({ owner, onHit, onDestroyed }: BulletCreateParams): Bullet {
        const bullet = new Bullet(
            this._entityManager.texture,
            this._collisionHandler,
            owner,
            onHit
        );
        bullet.onDied(() => {
            onDestroyed();
            this._entityManager.removeEntity(bullet)
        });
        this._entityManager.addEntity(bullet);
        return bullet;
    }
}