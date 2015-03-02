import { ScreenBase } from './screenBase';

export class ScreenManager {
    private _screens : ScreenBase<any>[] = [];
    private screenIndex = 0;

    constructor () {
        setInterval(() =>{
            if(this.screenIndex < this._screens.length)
                this._screens[this.screenIndex].update();
        }, 50);
    }

    public setScreen<TParams>(name: string, params: TParams) {
        this._screens[this.screenIndex].deactivate();
        for (var i = 0; i < this._screens.length; i++)
            if(this._screens[i].Name == name)
                this.screenIndex = i;
        if(this.screenIndex >= this._screens.length)
            throw "Screen '" + name + "' not found.";
        (this._screens[this.screenIndex] as ScreenBase<TParams>).activate(params);
    }

    public add(screen: ScreenBase<any>) {
        this._screens.push(screen);
    }
}