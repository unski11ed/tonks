import { Entity } from "../entity";
import { Texture } from "../texture";
import { EntityManager } from "../entityManager";

export class Points extends Entity {
    constructor (
        texture: Texture,
        x: number,
        y: number, 
        private _points: number,
        private _displayTime = 1000
    ) {
        super(0, 0, 0, 0, texture);
        
        this.x = x;
        this.y = y;

        setTimeout(() =>{
            this.die();
        }, this._displayTime);

        this.zIndex = 10;
    }
    public render(context : CanvasRenderingContext2D) {
        const textDim = context.measureText(this._points.toString());
        
        context.save();
        context.fillStyle = "white";
        context.font = "normal 10px 'Press Start 2P'";
        context.fillText(
            this._points.toString(),
            this.x - (textDim.width / 2), this.y
        );
        context.restore();
    }

    public testCollision(): Entity | null {
        return null;
    }

    public static create(
        entityManager: EntityManager,
        x: number,
        y: number, 
        pointsValue: number
    ): Entity {
        const points = new Points(
            entityManager.texture,
            x,
            y,
            pointsValue
        );
        
        entityManager.addEntity(points);

        return points;
    }
}
