import { MapProvider } from "./mapProvider";
import { EntityManager } from "./entityManager";
import { PlayerState, PlayerSpawnPoint } from "./actors/playerSpawnPoint";
import { Entity } from "./entity";
import { PlayerFactory } from "./actors/playerFactory";
import { EnemyFactory } from "./actors/enemyFactory";
import { EnemySpawnPoint } from "./actors/enemySpawnPoint";
import { WallTile } from "./tiles/wallTile";
import { ConcreteTile } from "./tiles/concreteTile";
import { MetalTile } from "./tiles/metalTile";
import { DefenceTile } from "./tiles/defenceTile";
import { BushTile } from "./tiles/bushTile";
import { WaterTile } from "./tiles/waterTile";
import { ExplosionFactory } from "./actors/explosionFactory";
import { Eagle } from "./tiles/eagle";
import { Map } from "./map"
import { MapBorder } from "./tiles/mapBorder";

const SPAWN_POINT_LOCATIONS = [
    { x: 0, y: 0 },
    { x: 12, y: 0 },
    { x: 24, y: 0 },
];

const PLAYER_SPAWN_POINT_LOCATIONS = [
    { x: 9, y: 24 },
    { x: 15, y: 24 },
];

const MAP_SIDE_LENGTH = 26;

export class MapCreator {
    constructor(
        private entityManager: EntityManager,
        private playerFactory: PlayerFactory,
        private enemyFactory: EnemyFactory,
        private explosionFactory: ExplosionFactory,
    ) { }

    public create(
        levelNo: number,
        playerStates: PlayerState[],
        playersCount: 1 | 2 = 1,
    ): Map {
        const mapDefinition = MapProvider.getMapDefinition(levelNo);
        const tiles: Entity[] = [];
        const playerSpawnPoints: PlayerSpawnPoint[] = [];
        const enemySpawnPoints: EnemySpawnPoint[] = [];

        // Add players spawn points
        const playerSpawnPoint = new PlayerSpawnPoint(
            this.entityManager.texture,
            1,
            this.playerFactory
        );
        playerSpawnPoint.tileX = PLAYER_SPAWN_POINT_LOCATIONS[0].x;
        playerSpawnPoint.tileY = PLAYER_SPAWN_POINT_LOCATIONS[0].y;

        playerSpawnPoints.push(playerSpawnPoint);
        playerSpawnPoint.restoreState(playerStates[0]);

        if (playersCount === 2) {
            const playerSpawnPoint = new PlayerSpawnPoint(
                this.entityManager.texture,
                2,
                this.playerFactory
            );
            playerSpawnPoint.tileX = PLAYER_SPAWN_POINT_LOCATIONS[1].x;
            playerSpawnPoint.tileY = PLAYER_SPAWN_POINT_LOCATIONS[1].y;

            playerSpawnPoints.push(playerSpawnPoint);
            playerSpawnPoint.restoreState(playerStates[1]);
        }
        this.entityManager.addEntities(playerSpawnPoints);
    
        // Add enemy spawn points
        const enemiesList = [...mapDefinition.enemyList];
        const totalSpawns = SPAWN_POINT_LOCATIONS.length;
        SPAWN_POINT_LOCATIONS.forEach((spawnPos, index) => {
            const sliceStart = Math.floor(index / totalSpawns * enemiesList.length);
            const sliceEnd = Math.floor((index + 1) / totalSpawns * enemiesList.length);
            const spawnEnemiesList = enemiesList.slice(sliceStart, sliceEnd);
            const enemySpawn = new EnemySpawnPoint(
                this.entityManager,
                spawnEnemiesList,
                this.enemyFactory,
            );
            enemySpawn.tileX = spawnPos.x;
            enemySpawn.tileY = spawnPos.y;

            enemySpawnPoints.push(enemySpawn);
        });
        this.entityManager.addEntities(enemySpawnPoints);

        // Create tiles
        for (var y = 0; y < MAP_SIDE_LENGTH; y++)
            for (var x = 0; x < MAP_SIDE_LENGTH; x++) {
                var tileId = mapDefinition.definition[y][x];
                let tile: Entity | null = null;

                switch (tileId) {
                    case '#':
                        tile = WallTile.create(this.entityManager);
                    break;
                    case '@':
                        tile = ConcreteTile.create(this.entityManager);
                    break;
                    case '%':
                        tile = BushTile.create(this.entityManager);
                    break;
                    case '!':
                        tile = DefenceTile.create(this.entityManager);
                    break;
                    case '~':
                        tile = WaterTile.create(this.entityManager);
                    break;
                    case '-':
                        tile = MetalTile.create(this.entityManager);
                    break;
                }

                if (tile != null) {
                    tile.x = tile.width * x;
                    tile.y = tile.height* y;

                    tiles.push(tile);
                }
            }
        // Create eagle
        const eagle = Eagle.create(
            this.entityManager,
            this.explosionFactory
        );

        // Map Border
        const borders = MapBorder.create(this.entityManager);

        return new Map(
            playerSpawnPoints,
            enemySpawnPoints,
            eagle,
            tiles,
            borders,
        );
    }
}