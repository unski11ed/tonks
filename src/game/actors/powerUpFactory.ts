import { EntityManager } from '../entityManager';
import { Entity } from '../entity';
import { randomArray } from '../utils';
import {
    PowerUp,
    PowerAttack,
    PowerDefence,
    PowerExtraLife,
    PowerFreezeEnemies,
    PowerShield,
    PowerWipeEnemies
 } from './powerUps';
import { Texture } from '../texture';
 
export class PowerUpFactory {
    private _currentPowerUp: Entity | null = null;

    constructor (
        private _entityManager: EntityManager
    ) { }

    public generatePowerUp() {
        if (this._currentPowerUp) {
            this._entityManager.removeEntity(this._currentPowerUp);
            this._currentPowerUp = null;
        }

        const possibleCoords = [3, 9, 15, 21];
        const tileX = randomArray(possibleCoords);
        const tileY = randomArray(possibleCoords);
        const possiblePowerUps: (new (texture: Texture) => PowerUp)[] = [
            PowerAttack,
            PowerDefence,
            PowerExtraLife,
            PowerFreezeEnemies,
            PowerShield,
            PowerWipeEnemies
        ];
        const PowerUpType = randomArray(possiblePowerUps);

        this._currentPowerUp = new PowerUpType(this._entityManager.texture);
        this._currentPowerUp.x = tileX * this._currentPowerUp.width / 2;
        this._currentPowerUp.y = tileY * this._currentPowerUp.height / 2;
        this._currentPowerUp.onDied(() => {
            this._entityManager.removeEntity(this._currentPowerUp as Entity)
        });

        this._entityManager.addEntity(this._currentPowerUp);
    }
}