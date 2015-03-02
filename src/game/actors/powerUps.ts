import { Entity } from "../entity";
import { Texture } from "../texture";
import { EntityManager } from "../entityManager";
import { Enemy } from "./enemy";
import { PlayerSpawnPoint } from './playerSpawnPoint';
import { Player } from './player';
import { DefenceTile } from '../tiles/defenceTile';

export abstract class PowerUp extends Entity {
    public duration?: number;

    constructor (texture: Texture, sourceX: number, sourceY: number) {
        super(sourceX, sourceY, 16, 15, texture);
        
        this.zIndex = 1;
        this.groupId = "PowerUp";
        
        setInterval(() =>{
            this.visible = !this.visible;
        }, 500);
    }

    public testCollision(entity: Entity): Entity | null {
        var e = super.testCollision(entity);
        if (e != null && entity.groupId == "Player") {
            if (this.firePowerUp) {
                this.firePowerUp(<Player>entity);
                (<Player>entity).points += 500;
                
                if (this.update && this.duration) {
                    setTimeout(() => {
                        this.die();
                    }, this.duration);
                } else {
                    this.die();
                }
            }
        }
        return null;
    }

    public abstract firePowerUp?(player: Player): void;
    public abstract update?(entityManager: EntityManager): void;
}

export class PowerExtraLife extends PowerUp {
    constructor (texture: Texture) {
        super(texture, 112, 15);
    }

    public firePowerUp(player: Player) {
        (<PlayerSpawnPoint>player.spawn).lives++;
    }

    public update() {  }
}

export class PowerAttack extends PowerUp {
    constructor (texture: Texture) {
        super(texture, 96, 15);
    }

    public firePowerUp(player: Player) {
        player.cannon.power++;
    }

    public update() {  }
}

export class PowerDefence extends PowerUp {
    public duration = 5000;
    private _shouldExecuteOnUpdate = false;

    constructor (texture: Texture) {
        super(texture, 128, 0);
    }

    public update(entityManager: EntityManager) {
        if (this._shouldExecuteOnUpdate) {
            const defenceBricks =
                entityManager.getEntitiesOfType<DefenceTile>(DefenceTile);
            
            defenceBricks.forEach((brick) => { brick.enableDefence() });

            this._shouldExecuteOnUpdate = false;
        }
    }

    public firePowerUp() {
        this._shouldExecuteOnUpdate = true;
        this.visible = false;
    }
}

export class PowerWipeEnemies extends PowerUp {
    public duration = 10;
    private _shouldExecuteOnUpdate = false;
    private _player: Player | null = null;

    constructor (texture: Texture) {
        super(texture, 96, 0);
    }

    public update(entityManager: EntityManager) {
        if (this._shouldExecuteOnUpdate) {
            const enemies = entityManager.getEntitiesOfType<Enemy>(Enemy);
            enemies.forEach((enemy) => {
                // Add points to the player
                if (this._player) {
                    this._player.points += enemy.pointsWorth;
                }
                enemy.die()
            });

            this._shouldExecuteOnUpdate = false;
        }
    }

    public firePowerUp(player: Player) {
        this._player = player;
        this._shouldExecuteOnUpdate = true;
        this.visible = false;
    }
}

export class PowerFreezeEnemies extends PowerUp {
    public duration = 5000;
    private _shouldExecuteOnUpdate = false;

    constructor (texture: Texture) {
        super(texture, 128, 15);
    }

    public update(entityManager: EntityManager) {
        if (this._shouldExecuteOnUpdate) {
            const enemies = entityManager.getEntitiesOfType<Enemy>(Enemy);
            enemies.forEach((enemy) => {
                if (enemy.active) {
                    enemy.freeze(this.duration);
                }
            });
            
            this._shouldExecuteOnUpdate = false;
        }
    }

    public firePowerUp() {
        this._shouldExecuteOnUpdate = true;
        this.visible = false;
    }
}

export class PowerShield extends PowerUp {
    constructor (texture: Texture) {
        super(texture, 112, 0);
    }

    public firePowerUp(player: Player) {
        player.invulnerable(5000);
    }

    public update() {  }
}