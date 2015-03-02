import { PlayerSpawnPoint } from "./actors/playerSpawnPoint";
import { EnemySpawnPoint } from "./actors/enemySpawnPoint";
import { Entity } from "./entity";
import { Eagle } from "./tiles/eagle";
import { MapBorder } from "./tiles/mapBorder";

export class Map {
    constructor(
        public playerSpawnPoints: PlayerSpawnPoint[],
        public enemySpawnPoints: EnemySpawnPoint[],
        public eagle: Eagle,
        public tiles: Entity[],
        public borders: MapBorder[],
    ) { }
}