import { Actor } from "./actor";
import { Timer } from "../timer";
import { Texture } from "../texture";
import { Angle } from "../angle";
import { Controller } from "../controllers/controller";
import { CollisionHandler } from "../collisionHandler";
import { Cannon } from "./cannon";
import { PlayerSpawnPoint } from "./playerSpawnPoint";
import { Entity } from "../entity";
import { Enemy } from "./enemy";

export class Player extends Actor {
    private _shieldFrames = [
        { x: 112, y: 48 },
        { x: 128, y: 48 }
    ];
    private _shieldAnimationDelay
        = new Timer(50);
    private _currentFrame = 0;

    public get playerNumber() {
        return this._playerNumber as 1 | 2;
    }

    public get killedEnemies() : string[]{
        return (<PlayerSpawnPoint>this.spawn).killedEnemies;
    }

    public get points() : number {
        return (<PlayerSpawnPoint>this.spawn).points;
    }
    public set points(val: number) {
        (<PlayerSpawnPoint>this.spawn).points = val;
    }

    public get lives() {
        return (<PlayerSpawnPoint>this.spawn).lives;
    }
    public set lives(val: number) {
        (<PlayerSpawnPoint>this.spawn).lives = val;
    }

    constructor (
        texture: Texture,
        sourceX: number,
        sourceY: number, 
        controller: Controller,
        collisionHandler: CollisionHandler,
        spawnPoint: PlayerSpawnPoint,
        cannon: Cannon,
        private _playerNumber = 1
    ) {
        super(texture, sourceX, sourceY, 16, 16, collisionHandler,
            controller, spawnPoint, cannon);

        this.groupId = "Player";

        cannon.asssignOwner(this);
    }

    public rotateLeft() {
        if(this.angle == Angle.West)
            return;
        this.angle = Angle.West;
        this.tileY = this.tileY;
    }

    public rotateRight() {
        if(this.angle == Angle.East)
            return;
        this.angle = Angle.East;
        this.tileY = this.tileY;
    }

    public rotateUp() {
        if(this.angle == Angle.North)
            return;
        this.angle = Angle.North;
        this.tileX = this.tileX;
    }

    public rotateDown() {
        if(this.angle == Angle.South)
            return;
        this.angle = Angle.South;
        this.tileX = this.tileX;
    }

    public render(context: CanvasRenderingContext2D) {
        super.render(context);

        if (this.indestructible) {
            if(this._shieldAnimationDelay.interval()) {
                this._currentFrame =
                    this._currentFrame === this._shieldFrames.length - 1 ?
                        0 : this._currentFrame + 1
            }

            context.drawImage(
                this._texture,
                this._shieldFrames[this._currentFrame].x,
                this._shieldFrames[this._currentFrame].y,
                16, 16,
                this.x, this.y,
                this.width, this.height
            );
        }
    }

    public hitEnemies(entities: Entity[]) {
        entities.filter((entity) => {
            if (
                entity.groupId === 'Eagle' ||
                entity.groupId === 'Enemy'
            ) {
                entity.hitPoints -= this.cannon.power;

                if (entity.groupId === 'Enemy' && entity.hitPoints === 0) {
                    const enemy = entity as Enemy;
                    this.points += enemy.pointsWorth;
                    this.killedEnemies.push(enemy.name);
                }
            }
        });
    }

    public invulnerable(time = 3000) {
        this.indestructible = true;
        setTimeout(() =>{
            this.indestructible = false;
        }, time);
    }

    public die() {
        this.lives--;
        super.die();
    }
}