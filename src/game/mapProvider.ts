import { EnemyType } from "./actors/enemyFactory";

const MAPS = [
    require('./stages/1.json'),
    require('./stages/2.json'),
    require('./stages/3.json'),
    require('./stages/4.json'),
    require('./stages/5.json'),
    require('./stages/6.json'),
    require('./stages/7.json'),
    require('./stages/8.json'),
    require('./stages/9.json'),
    require('./stages/10.json'),
    require('./stages/11.json'),
    require('./stages/12.json'),
    require('./stages/13.json'),
    require('./stages/14.json'),
    require('./stages/15.json'),
    require('./stages/16.json'),
    require('./stages/17.json'),
    require('./stages/18.json'),
    require('./stages/19.json'),
    require('./stages/20.json'),
    require('./stages/21.json'),
    require('./stages/22.json'),
    require('./stages/23.json'),
    require('./stages/24.json'),
    require('./stages/25.json'),
    require('./stages/26.json'),
    require('./stages/27.json'),
    require('./stages/28.json'),
    require('./stages/29.json'),
    require('./stages/30.json'),
    require('./stages/31.json'),
    require('./stages/32.json'),
    require('./stages/33.json'),
    require('./stages/34.json'),
    require('./stages/35.json'),
];

export type MapDefinition = {
    definition: string;
    enemyList: EnemyType[];
}

export class MapProvider {
    public static getMapDefinition(index: number) : MapDefinition{
        return MAPS[index - 1];
    }

    public static getMapsCount() {
        return MAPS.length;
    }
}
