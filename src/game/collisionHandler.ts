import { Entity } from './entity';
import { EntityManager } from './entityManager';

export class CollisionHandler {
    constructor (
        private entityManager: EntityManager
    ) { }

    public checkVerticalCollision(testedEntity: Entity) {
        const collidedEntities = new Array<Entity>();

        this.entityManager.getEntities().forEach((entity: Entity) =>{
            if (testedEntity != entity) {
                const c = entity.testCollision(testedEntity);
                if (c != null) {
                    collidedEntities.push(c);
                }
            }
        });

        return collidedEntities;
    }
}
