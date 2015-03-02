import { EntityFactory } from '../entityFactory';
import { Explosion } from './explosion';
import { EntityManager } from '../entityManager';

export type ExplosionCreateParams = {
    x: number,
    y: number,
};

export class ExplosionFactory implements EntityFactory<Explosion, ExplosionCreateParams> {
    constructor(
        private _entityManager: EntityManager
    ) {}

    create({ x, y }: ExplosionCreateParams): Explosion {
        const explosion = new Explosion(
            this._entityManager.texture,
            x,
            y
        );
        
        explosion.onDied(() => { this._entityManager.removeEntity(explosion) });

        this._entityManager.addEntity(explosion);

        return explosion;
    }
}