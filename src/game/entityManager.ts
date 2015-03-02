import { Entity } from './entity';
import { RenderContext } from './renderContext';
import { Texture } from './texture';

export class EntityManager {
    public get screenWidth() {
        return this._canvas.width;
    }
    public get screenHeight() {
        return this._canvas.height;
    }

    public get texture() {
        return this._texture;
    }

    private _context: RenderContext;
    private _entityList: Entity[] = new Array();
    
    constructor (private _texture: Texture, private _canvas: HTMLCanvasElement) {
        const context = _canvas.getContext("2d");
        if (!context) {
            throw "Failed to get canvas context.";
        }

        this._context = context;
        this._context.font = "16px Press Start 2P";
    }

    public addEntity(entity: Entity) {
        this._entityList.push(entity);
        this._entityList = this._entityList.sort((a, b) => {
            return a.zIndex - b.zIndex;
        });
    }

    public addEntities(entities: Entity[]) {
        entities.forEach(entity => {
            this.addEntity(entity);
        });
    }

    public removeEntity(entity: Entity) {
        var i = this._entityList.indexOf(entity);
        if (i != -1) {
            this._entityList.splice(i, 1);
        }
    }

    public getEntities() {
        return this._entityList;
    }

    public getEntitiesOfType<TargetType extends Entity>(type: any): TargetType[] {
        return this._entityList.filter((entity) => entity instanceof type) as TargetType[];
    }

    public process() {
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        for (var i = 0; i < this._entityList.length; i++) {
            const entity = this._entityList[i];
            if (entity.active && entity.update)
                entity.update(this);
        }
        for (var i = 0; i < this._entityList.length; i++) {
            this._entityList[i].render(this._context);
        }
    }

    public clear() {
        this._entityList.splice(0, this._entityList.length);
    }
}