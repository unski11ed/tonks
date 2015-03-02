import { Actor } from "./actor";
import { Texture } from "../texture";
import { Timer } from "../timer";
import { Controller } from '../controllers/controller';
import { CollisionHandler } from "../collisionHandler";
import { Cannon } from "./cannon";
import { EnemySpawnPoint } from "./enemySpawnPoint";
import { Entity } from "./../entity";

export class Enemy extends Actor {
    private _blinkDelay = new Timer(300);
    private _animationState = -1;

    public name = "Enemy";
    public pointsWorth = 0;

    constructor(
        texture: Texture,
        sourceX: number,
        sourceY: number,
        sourceWidth: number,
        sourceHeight: number, 
        controller: Controller,
        collisionHandler: CollisionHandler,
        spawnPoint: EnemySpawnPoint,
        cannon: Cannon,
        public hasPowerUp = false,
    ) {
        super(
            texture,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            collisionHandler,
            controller,
            spawnPoint,
            cannon
        );

        cannon.asssignOwner(this);

        this.groupId = "Enemy";
    }

    public hitEnemies(entities: Entity[]) {
        entities.filter((entity) => {
            if (
                entity.groupId === 'Eagle' ||
                entity.groupId === 'Player'
            ) {
                entity.hitPoints -= this.cannon.power;
            }
        });
    }

    public update() {
        if (this.hasPowerUp && this._blinkDelay.interval()) {
            this.sourceY += this._animationState * this.sourceHeight;
            this._animationState *= -1;
        }
        super.update();
    }

    public freeze(time: number = 5000) {
        this.active = false;

        setTimeout(() => { this.active = true }, time);
    }
}
