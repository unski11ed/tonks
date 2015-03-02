import { Entity } from "./../entity";
import { CollisionHandler } from "../collisionHandler";
import { Texture } from "../texture";
import { Cannon } from "./cannon";
import { Controller } from "../controllers/controller";
import { SpawnPoint } from "./spawnPoint";

export abstract class Actor extends Entity {
    public speed: number = 2;

    private _assignedX = false;
    private _assignedY = false;
    private _collisionExcludedEntities : Entity[] = new Array;

    public get CollisionExcludes() {
        return this._collisionExcludedEntities;
    }

    public get cannon() {
        return this._cannon;
    }

    public get spawn() {
        return this._spawnPoint;
    }

    constructor (
        texture: Texture,
        sourceX: number,
        sourceY: number,
        sourceWidth: number,
        sourceHeight: number,
        private _collisionHandler: CollisionHandler,
        private _controller: Controller,
        private _spawnPoint : SpawnPoint,
        private _cannon: Cannon
    ) {
        super(sourceX, sourceY, sourceWidth, sourceHeight, texture);

        this._controller.assignActor(this);

        this.zIndex = 1;
    }

    public update() {
        this.updateCollisionExcludes(
            this._collisionHandler.checkVerticalCollision(this));

        this._controller.update();
    }

    public moveHorizontal(deltaX : number) {
        if(deltaX < 0)
            this.rotateLeft();
        else
            this.rotateRight();

        this.x += deltaX * this.speed;
        
        const collidedEntity = this.updateCollisionExcludes(
            this._collisionHandler.checkVerticalCollision(this));
        if (collidedEntity.length > 0) {
            if(deltaX < 0)
                this.moveTo(collidedEntity[0].x + collidedEntity[0].width, this.y);
            else
                this.moveTo(collidedEntity[0].x - this.width, this.y);
            return false;
        }

        return true;
    }

    public moveVertical(deltaY : number) {
        if(deltaY < 0)
            this.rotateUp();
        else
            this.rotateDown();

        this.y += deltaY * this.speed;

        var collidedEntity = this.updateCollisionExcludes(
            this._collisionHandler.checkVerticalCollision(this));
        if (collidedEntity.length > 0) {
            if(deltaY < 0)
                this.moveTo(this.x, collidedEntity[0].y + collidedEntity[0].height);
            else
                this.moveTo(this.x, collidedEntity[0].y - this.height);
            return false;
        }

        return true;
    }

    public moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public updateRotation() {
        this.cannon.rotate(this.angle);
    }

    public updatePosition() {
        if ((!this._assignedX)&&(!this._assignedY)) {
            this._collisionExcludedEntities =
                this._collisionHandler.checkVerticalCollision(this);
        }

        if(this.x != 0)
            this._assignedX = true;
        if(this.y != 0)
            this._assignedY = true;
    }

    public shoot() {
        this.cannon.shoot();
    }

    public testCollision(entity: Entity): Entity | null {
        const e = super.testCollision(entity);
        
        return (this._collisionExcludedEntities.indexOf(entity) >= 0) ?
            null : e;
    }

    public hitEnemies?(
        enemies: Entity[],
        hitPosition: { x: number, y: number }
    ): void;

    private updateCollisionExcludes(collidedEntity : Entity[]) {
        var elementsToRemove: number[] = new Array();
        this._collisionExcludedEntities.forEach((excluded: Entity, index) =>{
            var i = collidedEntity.indexOf(excluded);
            if(i == -1)
                elementsToRemove.push(index);
        });
        elementsToRemove.forEach((index) =>{
            this._collisionExcludedEntities.splice(index, 1);
        });

        return collidedEntity.filter((i) =>
            !(this._collisionExcludedEntities.indexOf(i) > -1));
    }
}