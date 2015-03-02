import { WallTile } from "./wallTile";
import { ConcreteTile } from "./concreteTile";
import { Texture } from "../texture";
import { Entity } from "../entity";
import { EntityManager } from "../entityManager";

export class DefenceTile extends WallTile {
    private _isConcrete = false;
    private _concreteBrick: ConcreteTile;

    private _defaultSourceX: number;
    private _defaultSourceY: number;

    public defenceTime = 5000;
    constructor (texture: Texture) {
        super(texture);
        this._concreteBrick = new ConcreteTile(texture);
        
        this._defaultSourceX = this.sourceX;
        this._defaultSourceY = this.sourceY;

        this.groupId = "Tile";
    }

    public updatePosition() {
        this._concreteBrick.x = this.x;
        this._concreteBrick.y = this.y;
    }

    public testCollision(entity: Entity): Entity | null {
        if(this._isConcrete)
            return this._concreteBrick.testCollision(entity);
        else if(this.visible)
            return super.testCollision(entity);

        return null;
    }

    public enableDefence() {
        this._isConcrete = true;
        this.sourceX = this._concreteBrick.sourceX;
        this.sourceY = this._concreteBrick.sourceY;

        super.repair();
        this.visible = true;

        setTimeout(() =>{
            this.sourceX = this._defaultSourceX;
            this.sourceY = this._defaultSourceY;
            this._isConcrete = false;
        }, this.defenceTime);
    }

    public die() {
        this.visible = false;
        this._concreteBrick.die();
    }

    public static create(entityManager: EntityManager): DefenceTile {
        const defenceTile = new DefenceTile(entityManager.texture);
        
        defenceTile.onDied(() => entityManager.removeEntity(defenceTile));
        entityManager.addEntity(defenceTile);

        return defenceTile;
    }
}
