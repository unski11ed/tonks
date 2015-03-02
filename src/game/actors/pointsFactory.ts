import { EntityFactory } from '../entityFactory';
import { EntityManager } from '../entityManager';
import { Points } from './points';

export type PointsCreateParams = {
    x: number,
    y: number,
    value: number,
};

export class PointsFactory implements EntityFactory<Points, PointsCreateParams> {
    constructor(
        private _entityManager: EntityManager
    ) {}

    create({ x, y, value }: PointsCreateParams): Points {
        const points = new Points(
            this._entityManager.texture,
            x,
            y,
            value
        );

        points.onDied(() => this._entityManager.removeEntity(points));
        this._entityManager.addEntity(points);

        return points;
    }
}