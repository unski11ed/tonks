import { Entity } from "../entity";
import { Timer } from "../timer";
import { Texture } from "../texture";

export class Explosion extends Entity {
    private frames = [
        { x: 0, y: 32 },
        { x: 32, y: 32 },
        { x: 64, y: 32 },
    ];
    private currentFrame = 0;
    private timerDelay = new Timer(50);

    constructor (texture: Texture, x: number, y: number) {
        super(0, 32, 32, 32, texture);

        this.x = x - this.width / 2;
        this.y = y - this.height / 2;

        this.zIndex = 4;
    }

    public update() {
        if (this.timerDelay.interval()) {
            this.currentFrame++;
            if (this.currentFrame == this.frames.length) {
                this.die();
                return;
            }
        }
        this.sourceX = this.frames[this.currentFrame].x;
        this.sourceY = this.frames[this.currentFrame].y;
    }

    public testCollision(): Entity | null {
        return null;
    }
}
