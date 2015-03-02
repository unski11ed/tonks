import { Actor } from "../actors/actor";

export interface Controller {
    assignActor(actor: Actor): void;
    update(): void;
}