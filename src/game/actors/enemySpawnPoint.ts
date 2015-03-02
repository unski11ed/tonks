import { EnemyFactory, EnemyType } from "./enemyFactory";
import { Actor } from "./actor";
import { SpawnPoint } from "./spawnPoint";
import { PowerUpFactory } from "./powerUpFactory";

import { EntityManager } from "../entityManager";
import { Angle } from "../angle";

export class EnemySpawnPoint extends SpawnPoint {
    private _totalEnemies: number;
    private _powerUpSpawner: PowerUpFactory;
    private _lastSpawnTime: number = 0;

    public get lastSpawnTime() {
        return this._lastSpawnTime;
    }

    public get tanksCount() {
        return this._enemyList.length;
    }

    constructor (
        _entityManager: EntityManager,
        private _enemyList: EnemyType[],
        private _enemyFactory: EnemyFactory,
    ) {
        super(_entityManager.texture);

        this._totalEnemies = _enemyList.length;
        this._powerUpSpawner = new PowerUpFactory(_entityManager);
    }

    public spawn() {
        const nextEnemyType = this._enemyList.shift();
        const enemyIndex = this._totalEnemies - this._enemyList.length;

        if (nextEnemyType) {
            const enemy: Actor = this._enemyFactory.create({
                parentSpawnPoint: this,
                type: nextEnemyType,
                hasPowerUp: (enemyIndex == 4 || enemyIndex == 11 || enemyIndex == 18)
            });
            enemy.x = this.x;
            enemy.y = this.y;
            enemy.angle = Angle.South;
        }
    }

    public isEmpty(): boolean {
        return this._enemyList.length == 0;
    }

    public generatePowerUp() {
        this._powerUpSpawner.generatePowerUp();
    }
}