import { GameOverResult, LevelCompleteResult } from "./../game/game";
import { Timer } from "./../game/timer";
import { ScreenManager } from "./screenManager";
import { ScreenBase } from "./screenBase";
import { KeyboardHandler } from './../game/controllers/keyboardHandler';

export class ScreenResults extends ScreenBase<GameOverResult[] | LevelCompleteResult[]> {
    private _$tableGeneral: JQuery;
    private _hiScore = 20000;
    private _playerStates: GameOverResult[] | LevelCompleteResult[] = [];
    private _keyDelay = new Timer(100);

    constructor(
        screenManager : ScreenManager,
        private _$container : JQuery,
    ) {
        super("Results", screenManager);

        this._$tableGeneral = _$container.find(".results-screen__table")
    }

    public activate(params: GameOverResult[] | LevelCompleteResult[]) {
        this._playerStates = [];
        this._$container.addClass('app__screen--active');
        this._$tableGeneral.find('[data-element]').text('0');
        this._$tableGeneral.toggleClass('results-screen__table--two-players',
            params.length === 2);

        const currentHiScore = (params as LevelCompleteResult[]).reduce(
            (acc: number, result: GameOverResult | LevelCompleteResult) => acc + result.points,
            0
        );
        if (currentHiScore > this._hiScore) {
            this._hiScore = currentHiScore;
        }

        (params as LevelCompleteResult[]).forEach((playerResult, index: number) => {
            const values = this.extractValues(playerResult.enemiesKilled);

            // Speciffic Killed
            values.results.forEach(result => {
                this._$tableGeneral.find('[data-element="enemy--count"]')
                    .filter('[data-enemy-type="' + result.name.toLowerCase() + '"]')
                    .filter('[data-player="' + (index + 1).toString() + '"]')
                    .text(result.count);
                
                this._$tableGeneral.find('[data-element="enemy--score"]')
                    .filter('[data-enemy-type="' + result.name.toLowerCase() + '"]')
                    .filter('[data-player="' + (index + 1).toString() + '"]')
                    .text(result.points);
            });

            // Total Points
            this._$tableGeneral
                .find('[data-element="score--player' + (index + 1).toString() + '"]')
                .text(playerResult.points);

            // Total Killed
            this._$tableGeneral
                .find('[data-element="p' + (index + 1 ).toString() + '--count"]')
                .text(values.enemiesCount);
        });

        this._$container
            .find('[data-element="current-stage"]')
            .text(params[0].stage);
        this._$container
            .find('[data-element="score--hi"]')
            .text(this._hiScore);

        this._playerStates = params;
    }

    public update() {
        if (KeyboardHandler.isKeyPressed(16) && this._keyDelay.interval()) {
            if ((this._playerStates as LevelCompleteResult[])[0].state) {
                this.switch("LevelSelect", this._playerStates);
            } else {
                this.switch("MainMenu", { results: this._playerStates, hiScore: this._hiScore });
            }
        }
    }

    public deactivate() {
        this._$container.removeClass('app__screen--active');
    }

    private extractValues(enemiesKilled : string[]) {
        var results = new Array();
        var totalEnemiesKilled = enemiesKilled.length;
        var sortedEnemies = enemiesKilled.sort();

        var count = 0;
        for (var i = 0; i < sortedEnemies.length; i++) {
            var currentEnemy = sortedEnemies[i];
            count++;
            if (i >= sortedEnemies.length || currentEnemy != sortedEnemies[i + 1]) {
                var pointsDiff = 100;
                switch (currentEnemy) {
                    case "Small":
                        pointsDiff = 100;
                    break;
                    case "Fast":
                        pointsDiff = 200;
                    break;
                    case "Power":
                        pointsDiff = 300;
                    break;
                    case "Armor":
                        pointsDiff = 400;
                    break;
                }
                results.push({ name: currentEnemy, count: count, points: count * pointsDiff });
                count = 0;
                continue;
            }
        }
        return { enemiesCount: totalEnemiesKilled, results: results };
    }
}