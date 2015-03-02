import { ScreenBase } from "./screenBase";
import { ScreenManager } from "./screenManager";
import { LevelCompleteResult } from './../game/game';
import { Timer } from './../game/timer';
import { KeyboardHandler } from '../game/controllers/keyboardHandler';

export type ScreenMainMenuParams = {
    hiScore: number,
    results: LevelCompleteResult[],
};

export class ScreenMainMenu extends ScreenBase<ScreenMainMenuParams> {
    private _currentPosition = 0;
    private _keyDelay = new Timer(100);

    private _$selector: JQuery;
    private _$playerOneScore: JQuery;
    private _$hiScore: JQuery;
    private _$playerTwoScore: JQuery;

    constructor (
        screenManager: ScreenManager,
        private _$container: JQuery,
    ) {
        super('MainMenu', screenManager);

        this._$selector = _$container.find('[data-element=player-select]');
        this._$playerOneScore = _$container.find('[data-element=score--player1]');
        this._$hiScore = _$container.find('[data-element=score--hi]');
        this._$playerTwoScore = _$container.find('[data-element=score--player2]');
    }

    public update() {
        if (this._keyDelay.interval()) {
            if (KeyboardHandler.isKeyPressed(83) && this._currentPosition < 1) {
                this._currentPosition++;
            }
            if (KeyboardHandler.isKeyPressed(87) && this._currentPosition > 0) {
                this._currentPosition--
            }
            if (KeyboardHandler.isKeyPressed(16)) {
                var obj: LevelCompleteResult = {
                    playerNumber: 1,
                    enemiesKilled: [],
                    state: {
                        cannonPower: 1,
                        points: 0,
                        lives: 3,
                    },
                    stage: 0,
                    points: 0
                };
                var output = this._currentPosition == 0 ? [obj]: [obj, obj];
                this.switch('LevelSelect', output);
            }

            this._$selector.toggleClass('players-selection--one', this._currentPosition === 0);
            this._$selector.toggleClass('players-selection--two', this._currentPosition === 1);
        }
    }

    public activate(params: ScreenMainMenuParams) {
        this._keyDelay.interval();
        this._$container.addClass('app__screen--active');

        if (params.results) {
            params.results.forEach((result: LevelCompleteResult) => {
                if (result.playerNumber == 1)
                    this._$playerOneScore.text(result.points.toString());
                else
                    this._$playerTwoScore.text(result.points.toString());
            });
        }

        this._$hiScore.text(params.hiScore);
    }

    public deactivate() {
        this._$container.removeClass('app__screen--active');
    }
}