import { Controller } from "./controller";
import { Actor } from "../actors/actor";
import { KeyboardHandler } from './keyboardHandler';

export type KeybaordScheme = {
    up: number,
    down: number,
    left: number,
    right: number,
    shot: number,
}

export class KeyboardController implements Controller {
    private _actor: Actor | null = null;
    
    constructor(private _scheme: KeybaordScheme) { }

    public assignActor(actor: Actor) {
        this._actor = actor;
    }

    public update() {
        if(this._actor == null)
            throw "Actor must be assigned to controller before calling Update()";
        const { up, down, left, right, shot } = this._scheme;
        if (KeyboardHandler.isKeyPressed(left))
            this._actor.moveHorizontal(-1);
        else if(KeyboardHandler.isKeyPressed(right))
            this._actor.moveHorizontal(1);
        else if(KeyboardHandler.isKeyPressed(up))
            this._actor.moveVertical(-1);
        else if(KeyboardHandler.isKeyPressed(down))
            this._actor.moveVertical(1);

        if(KeyboardHandler.isKeyPressed(shot))
            this._actor.shoot();
    }
}
