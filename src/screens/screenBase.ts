import { ScreenManager } from './screenManager';

export abstract class ScreenBase<TParams> {
    public get Name() {
        return this._name;
    }

    constructor(
        private _name: string,
        private _manager: ScreenManager
    ) { }

    public switch<TTargetParams>(screenName: string, params: TTargetParams) {
        this._manager.setScreen<TTargetParams>(screenName, params);
    }
    abstract update(): void;
    abstract activate(params: TParams): void;
    abstract deactivate(): void;
}