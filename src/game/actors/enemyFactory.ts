import { EntityFactory } from "../entityFactory";
import { Enemy } from "./enemy";
import { EntityManager } from "../entityManager";
import { CollisionHandler } from "../collisionHandler";
import { ExplosionFactory } from "./explosionFactory";
import { PointsFactory } from './pointsFactory';
import { Cannon } from "./cannon";
import { BulletFactory } from "./bulletFactory";
import { EnemySpawnPoint } from "./enemySpawnPoint";
import { LocalAIController } from "../controllers/aiController";
import { Controller } from "../controllers/controller";

export enum EnemyType {
    Basic = 'Basic',
    Fast = 'Fast',
    Power = 'Power',
    Armor = 'Armor'
}

export type EnemyCreateParams = {
    type: EnemyType;
    parentSpawnPoint: EnemySpawnPoint;
    hasPowerUp: boolean;
};

export class EnemyFactory implements EntityFactory<Enemy, EnemyCreateParams> {
    constructor(
        private _entityManager: EntityManager,
        private _collisionHandler: CollisionHandler,
        private _explosionFactory: ExplosionFactory,
        private _bulletFactory: BulletFactory,
        private _pointsFactory: PointsFactory,
    ) { }

    create(params: EnemyCreateParams): Enemy {
        const controller: Controller = new LocalAIController();
        const cannon = new Cannon(this._bulletFactory, this._explosionFactory);

        let enemy: Enemy;
        switch (params.type) {
            default:
            case EnemyType.Basic:
                enemy = new Enemy(
                    this._entityManager.texture,
                    32, 16, 16, 16,
                    controller,
                    this._collisionHandler,
                    params.parentSpawnPoint,
                    cannon,
                    params.hasPowerUp
                );
                enemy.groupId = "Enemy";
                enemy.name = EnemyType.Basic.toString();
                enemy.pointsWorth = 100;
                enemy.speed = 1;
            break;

            case EnemyType.Fast:
                enemy = new Enemy(
                    this._entityManager.texture,
                    48, 16, 16, 16,
                    controller,
                    this._collisionHandler,
                    params.parentSpawnPoint,
                    cannon,
                    params.hasPowerUp
                );
                enemy.groupId = "Enemy";
                enemy.name = EnemyType.Fast.toString();
                enemy.pointsWorth = 200;
                enemy.speed = 3;
            break;

            case EnemyType.Power:
                enemy = new Enemy(
                    this._entityManager.texture,
                    64, 16, 16, 16,
                    controller,
                    this._collisionHandler,
                    params.parentSpawnPoint,
                    cannon,
                    params.hasPowerUp
                );
                enemy.groupId = "Enemy";
                enemy.name = EnemyType.Power.toString();
                enemy.pointsWorth = 300;
                enemy.cannon.bulletsSpeed = 7;
                enemy.speed = 1;
            break;

            case EnemyType.Armor:
                enemy = new Enemy(
                    this._entityManager.texture,
                    80, 16, 16, 16,
                    controller,
                    this._collisionHandler,
                    params.parentSpawnPoint,
                    cannon,
                    params.hasPowerUp
                );
                enemy.groupId = "Enemy";
                enemy.name = EnemyType.Armor.toString();
                enemy.pointsWorth = 400;
                enemy.hitPoints = 4;
                enemy.speed = 1;
            break;
        }

        enemy.onDied(() => {
            this._explosionFactory.create({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
            });
            this._pointsFactory.create({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                value: enemy.pointsWorth,
            });

            if(enemy.hasPowerUp) {
                params.parentSpawnPoint.generatePowerUp();
            }
            
            this._entityManager.removeEntity(enemy);
        });
        this._entityManager.addEntity(enemy);

        return enemy;
    }
}