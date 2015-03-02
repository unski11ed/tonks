export class Timer {
    private _lastTime = new Date().getTime();

    constructor (private delayMs: number, immediateStart: boolean = false) {
        this.interval();

        if (immediateStart) {
            this._lastTime = new Date().getTime() - this._lastTime;
        }
    }

    public interval(): boolean {
        var currentTime = new Date().getTime();
        if (currentTime - this._lastTime >= this.delayMs) {
            this._lastTime = currentTime;
            return true;
        }
        return false;
    }

    get delay() : number{
        return this.delayMs;
    }
    set delay(time: number) {
        this.delayMs = time;
    }
}