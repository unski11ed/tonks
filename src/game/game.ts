import { EntityManager } from "./entityManager";
import { PlayerState, PlayerSpawnPoint } from "./actors/playerSpawnPoint";
import { Texture } from "./texture";
import { Enemy } from "./actors/enemy";
import { MapProvider } from "./mapProvider";
import { MapCreator } from "./mapCreator";
import { EnemyFactory, EnemyType } from "./actors/enemyFactory";
import { PlayerFactory } from "./actors/playerFactory";
import { ExplosionFactory } from "./actors/explosionFactory";
import { BulletFactory } from "./actors/bulletFactory";
import { CollisionHandler } from "./collisionHandler";
import { Map } from "./map";
import { Timer } from "./timer";
import { Player } from "./actors/player";
import { PointsFactory } from "./actors/pointsFactory";

export type GameOverResult = {
    playerNumber: number;
    enemiesKilled: EnemyType[];
    points: number;
    stage: number;
}

export type LevelCompleteResult = {
    playerNumber: number;
    enemiesKilled: EnemyType[];
    points: number;
    stage: number;
    state: PlayerState;
}

export class Game {
    private _entityManager: EntityManager;
    
    private _enemyFactory: EnemyFactory;
    private _playerFactory: PlayerFactory;
    private _explosionFactory: ExplosionFactory;
    private _bulletFactory: BulletFactory;
    private _pointsFactoty: PointsFactory;
    private _mapCreator: MapCreator;

    private _lastEnemySpawnIndex = 0;
    private _enemySpawnDelay = new Timer(3000, true);
    private _levelIndex = 1;
    private _callbackCalled = false;
    private _loopActive = true;
    private _map: Map | null = null;

    public callbackGameOver: Function = () => { throw "GameOver callback not assigned"; };
    public callbackLevelComplete: Function = () => { throw "LevelComplete callback not assigned"; };
    public callbackUpdateHUD: Function = () => { throw "HUDUpdate callback not assigned" };

    constructor (
        canvas: HTMLCanvasElement,
        texture: Texture,
    ) {
        this._entityManager = new EntityManager(texture, canvas);
        
        const collisionHandler = new CollisionHandler(this._entityManager);

        this._explosionFactory = new ExplosionFactory(this._entityManager);
        this._pointsFactoty = new PointsFactory(this._entityManager);
        this._bulletFactory = new BulletFactory(
            this._entityManager,
            collisionHandler
        );
        this._enemyFactory = new EnemyFactory(
            this._entityManager,
            collisionHandler,
            this._explosionFactory,
            this._bulletFactory,
            this._pointsFactoty,
        );
        this._playerFactory = new PlayerFactory(
            this._entityManager,
            collisionHandler,
            this._explosionFactory,
            this._bulletFactory,
        );
        this._mapCreator = new MapCreator(
            this._entityManager,
            this._playerFactory,
            this._enemyFactory,
            this._explosionFactory,
        );
    }

    public startLevel(
        levelIndex: number,
        playersCount: 1 | 2,
        playersState: LevelCompleteResult[] | null = null
    ) {
        if (levelIndex > MapProvider.getMapsCount()) {
            this._levelIndex = levelIndex % MapProvider.getMapsCount();
        } else {
            this._levelIndex = levelIndex;
        }

        this._entityManager.clear();

        const states: LevelCompleteResult[] = playersState ? playersState : (
            playersCount === 2 ? [
                {
                    playerNumber: 1,
                    enemiesKilled: [],
                    points: 0,
                    stage: levelIndex,
                    state: new PlayerState(1, 3, 0)
                },
                {
                    playerNumber: 2,
                    enemiesKilled: [],
                    points: 0,
                    stage: levelIndex,
                    state: new PlayerState(1, 3, 0)
                }
            ] : [
                {
                    playerNumber: 1,
                    enemiesKilled: [],
                    points: 0,
                    stage: levelIndex,
                    state: new PlayerState(1, 3, 0)
                }
            ]
        );
        this._map = this._mapCreator.create(
            this._levelIndex,
            states.map(state => state.state),
            playersCount
        );

        this._map.playerSpawnPoints.forEach((spawnPoint) => {
            spawnPoint.spawn();
        });

        this._loopActive = true;
        this.loop();
    }

    private loop() {
        if (!this._map) return;

        this._entityManager.process();
        
        //Players dead
        const playersLives = this._map.playerSpawnPoints.reduce((acc: number, spawn) =>
            acc + spawn.lives, 0);
        if (playersLives == 0 || this._map.eagle.isDestroyed) {
            this.gameOver();
        }
        
        //Enemies dead
        const emptyEnemySpawnsCount = this._map.enemySpawnPoints.reduce((acc: number, spawn) =>
            acc + (spawn.isEmpty() ? 1 : 0), 0);
        if (
            emptyEnemySpawnsCount === this._map.enemySpawnPoints.length &&
            this._entityManager.getEntitiesOfType<Enemy>(Enemy).length == 0
        ) {
            this.stageClear();
        }

        // Respawn players
        const activePlayers = this._entityManager.getEntitiesOfType(Player) as Player[];
        if (activePlayers.length < this._map.playerSpawnPoints.length) {
            this._map.playerSpawnPoints.forEach((playerSpawn: PlayerSpawnPoint) => {
                const player = activePlayers.find((player: Player) =>
                    player.playerNumber === playerSpawn.playerNumber);
                if (!player && playerSpawn.lives > 0 && !playerSpawn.isRespawning) {
                    playerSpawn.beginRespawn();
                }
            });
        }

        // Respawn missing enemies
        const enemiesCount = this._entityManager.getEntitiesOfType(Enemy).length;
        if (enemiesCount < 4 && this._enemySpawnDelay.interval()) {
            const enemySpawnPoint = this._map.enemySpawnPoints[this._lastEnemySpawnIndex];
            enemySpawnPoint.beginRespawn();

            this._lastEnemySpawnIndex = (this._lastEnemySpawnIndex + 1) % this._map.enemySpawnPoints.length;
        }

        //update HUD
        const totalEnemiesCount = this._map.enemySpawnPoints.reduce((acc, spawn) =>
            spawn.tanksCount + acc, 0);
        const playerOneLifes = this._map.playerSpawnPoints[0].lives;
        const playerTwoLifes = this._map.playerSpawnPoints.length > 1 ?
            this._map.playerSpawnPoints[1].lives : -1;
        
        this.callbackUpdateHUD(
            this._levelIndex,
            totalEnemiesCount,
            playerOneLifes,
            playerTwoLifes
        );

        if (this._loopActive) {
            window.requestAnimationFrame(this.loop.bind(this));
        }
    }

    private gameOver() {
        if (
            !this._callbackCalled &&
            this._map
        ) {
            const results: GameOverResult[] = this._map.playerSpawnPoints.map((spawn) => ({
                playerNumber: spawn.playerNumber,
                points: spawn.points,
                enemiesKilled: spawn.killedEnemies,
                stage: this._levelIndex
            }));

            this.callbackGameOver(results);
            this._callbackCalled = true;
        }
    }

    private stageClear() {
        if (
            !this._callbackCalled &&
            this._map
        ) {
            const results: LevelCompleteResult[] = this._map.playerSpawnPoints.map((spawn) => ({
                playerNumber: spawn.playerNumber,
                points: spawn.points,
                enemiesKilled: spawn.killedEnemies,
                stage: this._levelIndex,
                state: spawn.saveState()
            }));

            this.callbackLevelComplete(results);
            this._callbackCalled = true;
        }
    }

    public stop() {
        this._loopActive = false;
    }
}