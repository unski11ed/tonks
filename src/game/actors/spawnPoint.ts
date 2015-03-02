import { Entity } from "./../entity";
import { Timer } from "./../timer";
import { Texture } from "./../texture";

export abstract class SpawnPoint extends Entity {
    private _frameDelay: Timer = new Timer(100);
    private _respawnTimer:  number = 1500;
    private _frames = [
        { x: 112, y: 32 },
        { x: 128, y: 32 }
    ];
    private _currentFrame = 0;

    constructor (texture: Texture) {
        super(0, 0, 16, 16, texture);
        this.visible = false;
    }

    public update() {
        if (this.visible) {
            if (this._frameDelay.interval()) {
                this._currentFrame++;
                if(this._currentFrame >= this._frames.length)
                    this._currentFrame = 0;
            }
            this.sourceX = this._frames[this._currentFrame].x;
            this.sourceY = this._frames[this._currentFrame].y;
        }
    }

    public beginRespawn() {
        if (!this.isEmpty()) {
            this._frameDelay.interval();
            this.visible = true;

            var _this = this;
            setTimeout(() =>{
                _this.visible = false;
                
                if (this.spawn) {
                    this.spawn();
                }
            }, this._respawnTimer);
        }
    }

    public isEmpty(): boolean { return false; }

    public testCollision(): Entity | null { return null; }

    public spawn?(): void;
}