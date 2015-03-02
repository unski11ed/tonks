import { EntityFactory } from "../entityFactory";
import { EntityManager } from "../entityManager";
import { CollisionHandler } from "../collisionHandler";
import { ExplosionFactory } from "./explosionFactory";
import { Controller } from "../controllers/controller";
import { Cannon } from "./cannon";
import { BulletFactory } from "./bulletFactory";
import { KeybaordScheme, KeyboardController } from "../controllers/keyboardController";
import { Player } from "./player";
import { Entity } from "../entity";
import { PlayerSpawnPoint } from "./playerSpawnPoint";

export type PlayerCreateParams = {
    playerNumber: 1 | 2;
    parentSpawnPoint: PlayerSpawnPoint;
};

const PLAYER_ONE_SCHEME: KeybaordScheme = {
    up: 87,
    down: 83,
    left: 65,
    right: 68,
    shot: 16,
};

const PLAYER_TWO_SCHEME: KeybaordScheme = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    shot: 191,
};

export class PlayerFactory implements EntityFactory<Player, PlayerCreateParams> {
    constructor(
        private _entityManager: EntityManager,
        private _collisionHandler: CollisionHandler,
        private _explosionFactory: ExplosionFactory,
        private _bulletFactory: BulletFactory,
    ) { }

    create(params: PlayerCreateParams): Player {
        const scheme = params.playerNumber === 1 ? PLAYER_ONE_SCHEME : PLAYER_TWO_SCHEME;
        const controller: Controller = new KeyboardController(scheme);
        const cannon = new Cannon(this._bulletFactory, this._explosionFactory);

        const sourceX = params.playerNumber === 1 ? 96 : 96;
        const sourceY = params.playerNumber === 1 ? 32 : 48;

        const player = new Player(
            this._entityManager.texture,
            sourceX, sourceY,
            controller,
            this._collisionHandler,
            params.parentSpawnPoint,
            cannon,
            params.playerNumber
        );

        player.onDied(() => {
            this._explosionFactory.create({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
            });
            
            this._entityManager.removeEntity(player as Entity);
        });
        this._entityManager.addEntity(player);

        return player;
    }
}