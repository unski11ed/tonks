import { ScreenBase } from "./screenBase";
import { Game, GameOverResult, LevelCompleteResult } from "./../game/game";
import { ScreenManager } from "./screenManager";
import $ from 'jquery';

const enemyIconImg = require('./../../assets/enemy_count.png');

export class ScreenGame extends ScreenBase<Game> {
    private _game: Game | null = null;
    private _$enemiesContainer: JQuery;
    private _$currentStage: JQuery;
    private _$playerOneLives: JQuery;
    private _$playerTwoLives: JQuery;
    private _$playerOneLivesContainer: JQuery;
    private _$playerTwoLivesContainer: JQuery;
    private _$gameOver: JQuery;

    constructor (
        screenManager: ScreenManager,
        private _$container: JQuery,
    ) {
        super("Game", screenManager);

        this._$enemiesContainer = _$container.find('[data-element=killed-enemies]');
        this._$currentStage = _$container.find('[data-element=current-stage]');
        this._$playerOneLives = _$container.find('[data-element=p1-lives]');
        this._$playerTwoLives = _$container.find('[data-element=p2-lives]');
        this._$playerOneLivesContainer = this._$playerOneLives.parent();
        this._$playerTwoLivesContainer = this._$playerTwoLives.parent();
        this._$gameOver = _$container.find('[data-element=game-over]');
    }

    public activate(game: Game) {
        this._$container.addClass('app__screen--active');
        this._game = game;

        // append enemies which will decrease with each kill
        for (var i = 0; i < 20; i++) {
            this._$enemiesContainer.append(
                $(`<img src='${enemyIconImg}' />`)
            );
        }

        this._game.callbackUpdateHUD = (
            stage: number,
            enemyCount: number,
            playerOneLives: number,
            playerTwoLives: number
        ) =>{
            if (this._$enemiesContainer.children().length > enemyCount) {
                this._$enemiesContainer.children().last().remove();
            }

            this._$currentStage.text(stage.toString());
            
            if (playerOneLives < 0) {
                this._$playerOneLivesContainer.hide();
            } else {
                this._$playerOneLivesContainer.show();
                this._$playerOneLives.text(playerOneLives.toString());
            }

            if (playerTwoLives < 0) {
                this._$playerTwoLivesContainer.hide();
            } else {
                this._$playerTwoLivesContainer.show();
                this._$playerTwoLives.text(playerTwoLives.toString());
            }
        };

        this._game.callbackGameOver = (result : GameOverResult[]) => {
            this._$gameOver.animate({ top: "50%" }, 1500, "linear", () => {
                setTimeout(() => {
                    this._game!.stop();
                    this.switch("Results", result);

                    this._$gameOver.css('top', '100%');
                }, 2000);
            });
        };

        this._game.callbackLevelComplete = (result : LevelCompleteResult[]) => {
            setTimeout(() => {
                this._game!.stop();
                this.switch("Results", result);
            }, 2000);

        };
    }

    public update() { }

    public deactivate() {
        this._$container.removeClass('app__screen--active');
    }
}