import { Actor } from './actor';
import { Angle } from '../angle';
import { Bullet } from './bullet';
import { Timer } from '../timer';
import { BulletFactory } from './bulletFactory';
import { ExplosionFactory } from './explosionFactory';

export class Cannon {
    private _owner: Actor | null = null;

    private _x: number = 0;
    private _y: number = 0;

    private _cooldownTimer = new Timer(500);

    private _bullets: Bullet[] = new Array();

    public totalBullets: number = 1;
    public bulletsSpeed: number = 5;
    public power: number = 1;

    constructor (
        private _bulletFactory: BulletFactory,
        private _explosionFactory: ExplosionFactory,
    ) { }

    public asssignOwner(owner: Actor) {
        this._owner = owner;
        this.rotate(this._owner.angle);
    }

    public rotate(angle: Angle) {
        if (this._owner) {
            switch (angle) {
                case Angle.North:
                    this._x = Math.round(this._owner.width / 2);
                    this._y = 0;
                break;
                case Angle.East:
                    this._x = this._owner.width;
                    this._y = Math.round(this._owner.height / 2);
                break;
                case Angle.South:
                    this._x = Math.round(this._owner.width / 2);
                    this._y = this._owner.height;
                break;
                case Angle.West:
                    this._x = 0;
                    this._y = Math.round(this._owner.height / 2);
                break;
            }
        } 
    }

    public shoot() {
        if (this._owner) {
            if (this._cooldownTimer.interval() && this._bullets.length < this.totalBullets) {
                const bullet = this._bulletFactory.create({
                    owner: this._owner,
                    onDestroyed: () => {
                        var index = this._bullets.indexOf(bullet);
                        if(index != -1)
                            this._bullets.splice(index, 1);
                        
                        this._explosionFactory.create({
                            x: bullet.x + (bullet.width / 2),
                            y: bullet.y + (bullet.height / 2),
                        });
                    },
                    onHit: (hitEntities, hitPosition) => {
                        if (this._owner && this._owner.hitEnemies) {
                            this._owner.hitEnemies(hitEntities, hitPosition);
                        }
                    }
                });
    
                bullet.x = this._owner.x + this._x - bullet.width / 2;
                bullet.y = this._owner.y + this._y - bullet.height / 2;
    
                if(this.power >= 1)
                    this.bulletsSpeed = 7;
                if(this.power >= 2)
                    this.totalBullets = 2;
                if(this.power >= 3)
                    bullet.superBullet = true;
    
                this._bullets.push(bullet);
            }
        }
    }
}