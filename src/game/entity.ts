import { Texture } from './texture';
import { RenderContext } from './renderContext';
import { EntityManager } from './entityManager';
import { Angle } from './angle';

export abstract class Entity {
    private _x: number = 0;
    private _y: number = 0;

    private _width: number = 50;
    private _height: number = 50;

    private _angle: Angle = 0;
    private _hitPoints = 1;

    private _dieCallback: (entity: Entity) => void = () => { };

    //Property x==========
    set x(val: number) {
        this._x = val;
        if (this.updatePosition)
            this.updatePosition();
    }
    get x() {
        return this._x;
    }
    //Property y==========
    set y(val: number) {
        this._y = val;
        if (this.updatePosition)
            this.updatePosition();
    }
    get y() {
        return this._y;
    }

    get tileX() : number {
        return Math.round((this.x) / 16);
    }
    set tileX(val: number) {
        this.x = val * 16;
    }

    get tileY() : number {
        return Math.round((this.y) / 16);
    }
    set tileY(val: number) {
        this.y = val * 16;
    }

    //Property width==========
    set width(val: number) {
        this._width = val;
        if (this.updateSize)
            this.updateSize();
    }
    get width() {
        return this._width;
    }
    //Property height==========
    set height(val: number) {
        this._height = val;
        if (this.updateSize)
            this.updateSize();
    }
    get height() {
        return this._height;
    }
    //Property angle===========
    set angle(val: number) {
        this._angle = val;
        if (this.updateRotation)
            this.updateRotation();
    }
    get angle() {
        return this._angle;
    }

    get hitPoints() {
        return this._hitPoints;
    }
    set hitPoints(value: number) {
        if(!this.indestructible)
            this._hitPoints = value;
        if(this._hitPoints <= 0)
            this.die();
    }

    public visible = true;
    public active = true;
    public zIndex = 0;
    public groupId : string = "None";
    public indestructible = false;

    constructor (
        public sourceX: number,
        public sourceY: number,
        public sourceWidth: number,
        public sourceHeight: number,
        protected _texture: Texture
    ) {
        this.width = 2 * sourceWidth;
        this.height = 2 * sourceHeight;
    }

    public onDied(dieCallback: () => void) {
        this._dieCallback = dieCallback;
    }

    public render(context : RenderContext) {
        if(!this.visible)
            return;

        context.save();

        var diff_x = this.x + (this.width / 2);
        var diff_y = this.y + (this.height / 2);

        context.translate(diff_x, diff_y);
        context.rotate(this._angle * Math.PI / 180);

        context.drawImage(this._texture, this.sourceX, this.sourceY,
                            this.sourceWidth, this.sourceHeight,
                            this.x - diff_x, this.y - diff_y, this.width, this.height);
        context.restore();
    }

    public rotateLeft() {
        this.angle = 270;
    }

    public rotateRight() {
        this.angle = 90;
    }

    public rotateUp() {
        this.angle = 0;
    }

    public rotateDown() {
        this.angle = 180;
    }

    public testCollision(entity: Entity): Entity | null {
        if (this.visible && !(
            entity.x >= this.x + this.width ||
            entity.x + entity.width <= this.x ||
            entity.y >= this.y + this.height ||
            entity.y + entity.height <= this.y
        )) {
            return this;
        }
        return null;
    }

    public die() {
        this._dieCallback(this);
    }

    public update?(entityManager: EntityManager): void;
    public updatePosition?(): void;
    public updateSize?(): void;
    public updateRotation?(): void;
}