import { Actor } from "../actors/actor";
import { Controller } from "./controller";

export class LocalAIController implements Controller {
    private _actor: Actor | null = null;
    private _movementFunctions: Function[] = new Array();
    
    private _currentMovement: number = 0;
    private _currentDirection: number = 1;

    public assignActor(actor: Actor) {
        this._actor = actor;

        this._movementFunctions[0] = this._actor.moveVertical;
        this._movementFunctions[1] = this._actor.moveHorizontal;
    }

    public update() {
        if (!this._actor)
            return;

        const movementFunc = this._movementFunctions[this._currentMovement].bind(this._actor);
        const result = movementFunc(this._currentDirection);

        if (!result) {
            this.chooseNewDirection();
        } else {
            const chance = Math.round(Math.random() * 100);
            
            if (
                chance < 10 &&
                this._actor.x / 16 == Math.round(this._actor.x / 16) &&
                this._actor.y / 16 == Math.round(this._actor.y / 16)
            ) {

                this.chooseNewDirection();
            }

        }
        this._actor.shoot();
    }

    private chooseNewDirection() {
        this._currentMovement = Math.round(Math.random());
        this._currentDirection = Math.round(Math.random()) == 0 ? -1 : 1;
    }
}