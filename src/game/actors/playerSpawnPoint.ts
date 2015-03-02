import { EnemyType } from "../actors/enemyFactory";
import { Player } from "./player";
import { Texture } from "./../texture";
import { PlayerFactory } from "./playerFactory";
import { SpawnPoint } from "./spawnPoint";

export class PlayerState {
    constructor (
        public readonly cannonPower: number,
        public readonly lives: number,
        public readonly points: number
    ) { }
}

interface IPlayerMemento {
    saveState(): PlayerState;
    restoreState(state: PlayerState) : void;
}

export class PlayerSpawnPoint extends SpawnPoint implements IPlayerMemento {
    public playerInstance: Player | null = null;
    public killedEnemies: EnemyType[] = [];
    
    private _points = 0;
    private _cannonPower = 0;
    private _isRespawning = false;

    public get cannonPower() {
        var ret = this._cannonPower;
        this._cannonPower = 0;
        return ret;
    }
    
    public get playerNumber() {
        return this._playerNumber;
    }
    
    public get points() : number {
        return this._points;
    }
    public set points(val: number) {
        this._points = val;
        if(val <= 500 && this._points % 20000 == 0)
            (this).lives++;
    }

    public get isRespawning() {
        return this._isRespawning;
    }

    constructor (
        texture: Texture,
        private _playerNumber: 1 | 2 = 1,
        private _playerFactory: PlayerFactory,
        public lives = 3,
    ) {
        super(texture);
    }

    public beginRespawn() {
        super.beginRespawn();
        this._isRespawning = true;
    }

    public spawn() {
        if (this.lives >= 0) {
            const player = this._playerFactory.create({
                playerNumber: this._playerNumber,
                parentSpawnPoint: this,
            });
            
            player.x = this.x;
            player.y = this.y;
            player.invulnerable(3000);
            player.cannon.power = this._cannonPower;

            this.playerInstance = player;

            this._isRespawning = false;
        } else {
            this.playerInstance = null;
        }
    }

    public saveState(): PlayerState {
        return new PlayerState(
            this.playerInstance === null ?
                0 : this.playerInstance.cannon.power,
            this.lives,
            this.points
        );
    }

    public restoreState(state : PlayerState) {
        if (state != null) {
            this._cannonPower = state.cannonPower;
            this._points = state.points;
            this.lives = state.lives;
        }
    }

    public isEmpty(): boolean {
        return this.lives < 0;
    }
}
