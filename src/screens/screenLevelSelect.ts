import { ScreenBase } from "./screenBase";
import { ScreenManager } from "./screenManager";
import { LevelCompleteResult, Game } from "./../game/game";
import { Timer } from "./../game/timer";
import { MapProvider } from "./../game/mapProvider";
import { KeyboardHandler } from './../game/controllers/keyboardHandler';

export class ScreenLevelSelect extends ScreenBase<LevelCompleteResult[]> {
    private _active = false;
    private _game: Game | null = null;
    private _totalLevels = 1;
    private _selectedLevel = 1;
    private _players: 1 | 2 = 1;
    private _levelSwitchDelay = new Timer(100);
    private _playersState: LevelCompleteResult[] | null = null;

    private _$upperRect: JQuery;
    private _$lowerRect: JQuery;
    private _$levelContainer: JQuery;
    private _$levelIndex: JQuery;

    private get selectedLevel() {
        return this._selectedLevel;
    }
    private set selectedLevel(val: number) {
        this._selectedLevel = val;
        this._$levelIndex.text(this._selectedLevel);
    }

    constructor (
        screenManager: ScreenManager,
        private _$container: JQuery,
        private _gameTexture: HTMLImageElement, 
        private _gameCanvasElement: HTMLCanvasElement
    ) {
        super("LevelSelect", screenManager);

        this._$upperRect = this._$container.find('.level-selection__upper-rect');
        this._$lowerRect = this._$container.find('.level-selection__lower-rect');
        this._$levelContainer = this._$container.find('.level-selection__value');
        this._$levelIndex = this._$container.find('[data-element=level-no]');
    }

    public activate(results: LevelCompleteResult[]) {
        this._$container.addClass('app__screen--active');
        this._$upperRect.animate({ bottom: "50%" }, 200);
        this._$lowerRect.animate({ top: "50%" }, 200, "linear", () => {
            this._$levelContainer.show();
            this._active = true;
        });

        this._playersState = results;
        this._players = results.length > 1 ? 2 : 1;
        this.selectedLevel = results[0].stage + 1;

        this._totalLevels = MapProvider.getMapsCount();

        this._game = new Game(this._gameCanvasElement, this._gameTexture);
    }

    public update() {
        if (this._active && this._levelSwitchDelay.interval()) {
            if (this.selectedLevel < this._totalLevels && KeyboardHandler.isKeyPressed(87)) {
                this.selectedLevel++;
            }
                
            if (this.selectedLevel > 1 && KeyboardHandler.isKeyPressed(83)) {
                this.selectedLevel--;
            }
                
            if (KeyboardHandler.isKeyPressed(16) && this._game) {
                this.switch("Game", this._game);
                this._game.startLevel(this.selectedLevel, this._players, this._playersState);
            }
        }
    }

    public deactivate() {
        this._$container.removeClass('app__screen--active');
        
        this._active = false;

        this._$lowerRect.animate({ top: "0" }, 200);
        this._$upperRect.animate({ bottom: "0" }, 200);
    }
}