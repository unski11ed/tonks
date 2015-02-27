/// <reference path="jquery.d.ts" />

class ScreenManager {
    private _screens : ScreenUI[] = new Array();
    private screenIndex = 0;

    constructor () {
        setInterval(() =>{
            if(this.screenIndex < this._screens.length)
                this._screens[this.screenIndex].Update();
        }, 50);
    }

    public SetScreen(name: string, params : any[]) {
        this._screens[this.screenIndex].Deactivate();
        for (var i = 0; i < this._screens.length; i++)
            if(this._screens[i].Name == name)
                this.screenIndex = i;
        if(this.screenIndex >= this._screens.length)
            throw "Screen '" + name + "' not found.";
        this._screens[this.screenIndex].Activate(params);
    }

    public Add(screen: ScreenUI) {
        this._screens.push(screen);
    }
}

class ScreenUI {
    public get Name() {
        return this._name;
    }

    constructor(private _name: string, private _manager: ScreenManager) {
    }

    public Switch(screenName: string, params: any[]) {
        this._manager.SetScreen(screenName, params);
    }
    public Update() { }
    public Activate(params: any[]) { }
    public Deactivate() { }
}

class ScreenMainMenu extends ScreenUI{
    private currentPosition = 0;
    private _keyDelay = new Timer(100);

    constructor (private screenManager : ScreenManager,
                 private container: JQuery, private selector: JQuery, private margin_diff : number,
                 private playerOneScore : JQuery, private hiScore : JQuery, private playerTwoScore : JQuery) {
        super('MainMenu', screenManager);
    }

    public Update() {
        if (this._keyDelay.Interval()) {
            if (KeyboardHandler.IsKeyPressed(83) && this.currentPosition < 1) {
                this.currentPosition++;
                this.selector.css('margin-top', this.currentPosition * this.margin_diff + 'px');
            }
            if (KeyboardHandler.IsKeyPressed(87) && this.currentPosition > 0) {
                this.currentPosition--;
                this.selector.css('margin-top', this.currentPosition * this.margin_diff + 'px');
            }
            if (KeyboardHandler.IsKeyPressed(32)) {
                var obj: ILevelCompleteResult = {
                    PlayerNumber: 1, EnemiesKilled: new Array(),
                    State: null, Stage: 0, Points: 0
                };
                var output = this.currentPosition == 0? new Array(obj): new Array(obj, obj);
                this.Switch('LevelSelect', new Array(output));
            }
        }
    }

    public Activate(params: any[]) {
        this._keyDelay.Interval();
        this.container.css('display', 'block');
        if (params.length == 2) {
            params[0].forEach((param: IGameOverResult) {
                if(param.PlayerNumber == 1)
                    this.playerOneScore.text(param.Points.toString());
                else
                    this.playerTwoScore.text(param.Points.toString());
            });
            this.hiScore.text(params[1]);
        }
    }

    public Deactivate() {
        this.container.css('display', 'none');
    }
}
class ScreenLevelSelect extends ScreenUI{
    private _active = false;
    private _game: Game;
    private _totalLevels = 1;
    private _selectedLevel = 1;
    private _players = 1;
    private _levelSwitchDelay = new Timer(100);
    private _playersState: ILevelCompleteResult[] = null;

    private get selectedLevel() {
        return this._selectedLevel;
    }
    private set selectedLevel(val: number) {
        this._selectedLevel = val;
        this.levelIndex.text("STAGE " + this._selectedLevel);
    }

    constructor (screenManager: ScreenManager, private container: JQuery, private upperRect: JQuery,
                private lowerRect: JQuery, private levelIndex: JQuery, private gameTexture:HTMLImageElement, 
                private gameCanvas:HTMLCanvasElement) {
        super("LevelSelect", screenManager);
    }

    public Activate(params: any[]) {
        this.container.css('display', 'block');
        this.upperRect.animate({ top: "0px" }, 200);
        this.lowerRect.animate({ top: "208px" }, 200, "linear", () =>{
            this.levelIndex.css("display", "block");
            this._active = true;
        });
        var mapRequester = new MapRequester("http://ups7r4k7.webd.pl/maciej/tonks/");
        //var mapRequester = new MapRequester("http://localhost/tonks/");

        var results: ILevelCompleteResult[] = params[0];
        this._playersState = results;
        this._players = results.length;
        this.selectedLevel = results[0].Stage + 1;


        this._totalLevels = mapRequester.GetMapsCount();
        this._game = new Game(this.gameCanvas, this.gameTexture, mapRequester);
    }

    public Update() {
        if (this._active && this._levelSwitchDelay.Interval()) {
            if (this.selectedLevel < this._totalLevels && KeyboardHandler.IsKeyPressed(87)) 
                this.selectedLevel++;
            if (this.selectedLevel > 1 && KeyboardHandler.IsKeyPressed(83)) 
                this.selectedLevel--;
            if (KeyboardHandler.IsKeyPressed(32)) {
                this._game.StartLevel(this.selectedLevel, this._players, this._playersState);
                this.Switch("Game", Array(this._game));
            }
        }
    }

    public Deactivate() {
        this.container.css('display', 'none');
        this._active = false;
        this.levelIndex.css("display", "none");
        this.lowerRect.animate({ top: "416px" }, 200);
        this.upperRect.animate({ top: "-208px" }, 200);
    }
}

class ScreenGame extends ScreenUI {
    private _game: Game;
    private _stage = 0;

    constructor (screenManager: ScreenManager, private container : JQuery, private stage_label: JQuery,
                private player_one_label: JQuery,private player_two_label : JQuery, 
                private enemy_count_container: JQuery, private game_over_label:JQuery) {
        super("Game", screenManager);
    }

    public Activate(params: any[]) {
        this.container.show();
        this._game = params[0];

        //odswiez iloscc przeciwnikow na HUDzie
        for (var i = 0; i < 20; i++)
            this.enemy_count_container.append($("<img class='image_enemy' src='enemy_count.png' />"));

        this._game.CallbackUpdateHUD = (stage: number, enemyCount: number, playerOneLives: number, playerTwoLives) =>{
            var diff = this.enemy_count_container.children("img").length - enemyCount;
            if(diff > 0)
                for (var i = 0; i < diff; i++)
                    this.enemy_count_container.children("img").last().remove();

            this.stage_label.text(stage.toString());
            
            if (playerOneLives < 0)
                $("#p1_placeholder").css("opacity", "0");
            else {
                $("#p1_placeholder").css("opacity", "1");
                this.player_one_label.text(playerOneLives.toString());
            }

            if (playerTwoLives < 0)
                $("#p2_placeholder").css("opacity", "0");
            else {
                $("#p2_placeholder").css("opacity", "1");
                this.player_two_label.text(playerTwoLives.toString());
            }

            this._stage = stage;
        };

        this._game.CallbackGameOver = (result : IGameOverResult[]) => {
            this.game_over_label.animate({ left: "200px" }, 1500, "linear", () =>{
                setTimeout(() =>{
                    this._game.Stop();
                    this.Switch("Results", new Array(result));
                }, 2000);
            });
        };

        this._game.CallbackLevelComplete = (result : ILevelCompleteResult[]) => {
            setTimeout(() =>{
                this._game.Stop();
                this.Switch("Results", new Array(result));
            }, 2000);

        };

        this.game_over_label.css("left", -(this.game_over_label.width()));
    }

    public Deactivate() {
        this.container.hide();
    }
}

interface IGameOverResult {
    PlayerNumber: number;
    EnemiesKilled: string[];
    Points: number;
    Stage: number;
}

interface ILevelCompleteResult {
    PlayerNumber: number;
    EnemiesKilled: string[];
    Points: number;
    Stage: number;
    State: PlayerState;
}

class ScreenResults extends ScreenUI{
    private playerStates = null;
    private _hiScore = 0;
    private _playerScores: number[] = new Array();
    private _stage = 1;
    private _keyDelay = new Timer(100);
    constructor(screenManager : ScreenManager, private container : JQuery,
                 private tableGeneral : JQuery,
                 private tablePoints: JQuery, private tableResults: JQuery) {
        super("Results", screenManager);
    }

    public Activate(params: any[]) {
        this.container.show();
        var hiscore = 20000;
        $(".reset").text("0"); // reset all fields

        var input = params[0];
        for (var i = 0; i < input.length; i++) {
            var player = input[i].PlayerNumber == 1 ? "playerOne" : "playerTwo";
            var results = this.extractValues(input[i].EnemiesKilled);
            results.results.forEach((val)=>{
                this.tableResults.find("." + player + ".result_Count_" + val.name).text(val.count);
                this.tableResults.find("." + player + ".result_Points_" + val.name).text(val.points);
            });
            this.tableResults.find("." + player + ".results_totalKilled").text(results.enemiesCount.toString());
            this.tablePoints.find("." + player + ".totalPoints").text(input[i].Points.toString());
            if(input[i].Points > hiscore)
                hiscore = input.Points;
            this._playerScores.push(input[i].Points);
        }
        this._stage = input[0].Stage;
        this.tableGeneral.find("#result_stage").text(this._stage.toString());
        this.tableGeneral.find("#result_hiscore").text(hiscore.toString());
        if (input.length == 1) {
            $(".playerTwo").hide();
        }
        
        this.playerStates = input;
        this._hiScore = hiscore;
    }

    public Update() {
        if (KeyboardHandler.IsKeyPressed(32) && this._keyDelay.Interval()) {
            if (this.playerStates[0].State != undefined) {
                this.Switch("LevelSelect", new Array(this.playerStates));
            } else {
                this.Switch("MainMenu", new Array(this.playerStates, this._hiScore));
            }
        }
    }

    public Deactivate() {
        this.container.hide();
    }

    private extractValues(enemiesKilled : string[]) {
        var results = new Array();
        var totalEnemiesKilled = enemiesKilled.length;
        var sortedEnemies = enemiesKilled.sort();

        var count = 0;
        for (var i = 0; i < sortedEnemies.length; i++) {
            var currentEnemy = sortedEnemies[i];
            if (i >= sortedEnemies.length||currentEnemy != sortedEnemies[i + 1]) {
                count++;
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
            count++;
        }
        return { enemiesCount: totalEnemiesKilled, results: results };
    }
}

$(document).ready(() =>{
    document.addEventListener("keydown", (e : KeyboardEvent) =>{ KeyboardHandler.KeyDown((e.keyCode ? e.keyCode : e.which)) });
    document.addEventListener("keyup", (e : KeyboardEvent) =>{ KeyboardHandler.KeyUp((e.keyCode ? e.keyCode : e.which)) });

    var screenManager = new ScreenManager();
    var mainMenu = new ScreenMainMenu(screenManager, $("#mainMenu").first(), $("#selector").first(), 24,
                                      $("#playerOneScore").first(), $("hiScore").first(), $("playerTwoScore").first());
    
    var levelSelect = new ScreenLevelSelect(screenManager, $("#levelSelect").first(), $("#rectUpper").first(),
                                            $("#rectLower").first(), $("#levelselect_stage").first(),
                                            <HTMLImageElement>document.getElementById('texture'),
                                            <HTMLCanvasElement>document.getElementById('screen'));
    var game = new ScreenGame(screenManager, $("#game").first() ,$("#stage_index").first(), $("#P1_lives").first(),
                                             $("#P2_lives").first(), $("#enemy_tanks").first(), $("#gameOver").first());      
    var results = new ScreenResults(screenManager, $("#results").first(), $("#resultsGeneral").first(),
                                    $("#resultsPoints").first(), $("#resultsEnemies").first());

    screenManager.Add(mainMenu);
    screenManager.Add(levelSelect);
    screenManager.Add(game);
    screenManager.Add(results);
    screenManager.SetScreen('MainMenu', new Array());
});

interface IRenderable {
    render(context: CanvasRenderingContext2D);
}

class Timer {
    private _lastTime= new Date().getTime();

    constructor (private delayMs: number) {
        this.Interval();
    }

    public Interval(): bool {
        var currentTime = new Date().getTime();
        if (currentTime - this._lastTime >= this.delayMs) {
            this._lastTime = currentTime;
            return true;
        }
        return false;
    }

    get Delay() : number{
        return this.delayMs;
    }
    set Delay(time: number) {
        this.delayMs = time;
    }
}

class Entity {
    private _x: number = 0;
    private _y: number = 0;

    private _width: number = 50;
    private _height: number = 50;

    private _angle: number = 0;
    private _hitPoints = 1;
    //Property x==========
    set x(val: number) {
        this._x = val;
        this.updatePosition();
    }
    get x() {
        return this._x;
    }
    //Property y==========
    set y(val: number) {
        this._y = val;
        this.updatePosition();
    }
    get y() {
        return this._y;
    }

    get tileX() : number {
        return Math.round((this.x) / 16);
    }
    set tileX(val: number) {
        this.x = val * 16;
    }

    get tileY() : number {
        return Math.round((this.y) / 16);
    }
    set tileY(val: number) {
        this.y = val * 16;
    }

    //Property width==========
    set width(val: number) {
        this._width = val;
        this.updateSize();
    }
    get width() {
        return this._width;
    }
    //Property height==========
    set height(val: number) {
        this._height = val;
        this.updateSize();
    }
    get height() {
        return this._height;
    }
    //Property angle===========
    set angle(val: number) {
        this._angle = val;
        this.updateRotation();
    }
    get angle() {
        return this._angle;
    }

    get HitPoints() {
        return this._hitPoints;
    }
    set HitPoints(value: number) {
        if(!this.Indestructible)
            this._hitPoints = value;
        if(this._hitPoints <= 0)
            this.die();
    }

    public Visible = true;
    public Active = true;
    public ZIndex = 0;
    public GroupId : string = "None";
    public Indestructible = false;

    constructor (public objectManager: ObjectManager, public sourceX: number,
                public sourceY: number, public sourceWidth: number, public sourceHeight, autoAddToManager = true) {
        
        this.width = 2 * sourceWidth;
        this.height = 2 * sourceHeight;

        if(autoAddToManager)
            objectManager.AddEntity(this);
    }

    public render(context : CanvasRenderingContext2D) {
        if(!this.Visible)
            return;

        context.save();

        var diff_x = this.x + (this.width / 2);
        var diff_y = this.y + (this.height / 2);

        context.translate(diff_x, diff_y);
        context.rotate(this._angle * Math.PI / 180);

        context.drawImage(this.objectManager.Texture, this.sourceX, this.sourceY,
                            this.sourceWidth, this.sourceHeight,
                            this.x - diff_x, this.y - diff_y, this.width, this.height);
        context.restore();
    }

    public rotateLeft() {
        this.angle = 270;
    }

    public rotateRight() {
        this.angle = 90;
    }

    public rotateUp() {
        this.angle = 0;
    }

    public rotateDown() {
        this.angle = 180;
    }

    public update() {
    }

    public updatePosition() {
    }

    public updateSize() {
    }

    public updateRotation() {
    }

    public testCollision(entity: Entity) : Entity {
        if (!(entity.x >= this.x + this.width
                || entity.x + entity.width <= this.x
                || entity.y >= this.y + this.height
                || entity.y + entity.height <= this.y)) {
            return this;
            }
        return null;
    }

    public die() {
        this.objectManager.RemoveEntity(this);
    }
}

class MapBorder extends Entity {
    constructor (objectManager: ObjectManager, x:number, y:number, width:number, height:number) {
        super(objectManager, 0, 0, 0, 0);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public render(context : CanvasRenderingContext2D) {
    }

    public update() {
    }

    public static GenerateBorders(objectManager : ObjectManager) {
        new MapBorder(objectManager, -50, 0, 50, 500); //lewa sciana
        new MapBorder(objectManager, objectManager.ScreenWidth, 0, 50, 500); //prawa
        new MapBorder(objectManager, 0, -50, 500, 50); //gora
        new MapBorder(objectManager, 0, objectManager.ScreenHeight, 500, 50);
    }

    public die() {
    }
}
class WallBrick extends Entity {
    private verticalHP = 2;
    private horizontalHP = 2;
    private masks = new Array();

    constructor (objectManager : ObjectManager) {
        super(objectManager, 0, 0, 8, 8);
        this.HitPoints = 10000;
    }

    public testCollision(entity: Entity): Entity {
        var output = super.testCollision(entity);
        if (output != null && entity instanceof Bullet) {
            var bullet = <Bullet>entity;
            if (bullet.Angle == 90 || bullet.Angle == 270) {
                var mask = bullet.Angle == 90 ? { x: 0, y: 0, w: this.width / 2, h: this.height } :
                                                { x: this.width / 2, y: 0, w: this.width / 2, h: this.height };
                this.masks.push(mask);
                this.horizontalHP--;
            } else {
                var mask = bullet.Angle == 0 ? { x: 0, y: this.height / 2, w: this.width, h: this.height / 2} :
                                               { x: 0, y: 0, w: this.width, h: this.height / 2 };
                this.masks.push(mask);
                this.verticalHP--;
            }
            if(this.horizontalHP <= 0 || this.verticalHP <= 0 || bullet.SuperBullet)
                this.die();
        }
        return output;
    }

    public render(context: CanvasRenderingContext2D) {
        super.render(context);
        //render masks
        var _this = this;
        this.masks.forEach((mask) =>{
            context.fillRect(_this.x + mask.x, _this.y + mask.y, mask.w, mask.h);
        });
    }

    public Repair() {
        this.masks.splice(0, this.masks.length);
        this.verticalHP = this.horizontalHP = 2;
    }
}

class DefenceBrick extends WallBrick {
    private _isConcrete = false;
    private _concreteBrick: ConcreteBrick;

    private _defaultSourceX: number;
    private _defaultSourceY: number;

    private defenceTime = 5000;
    constructor (objectManager: ObjectManager) {
        super(objectManager);
        this._concreteBrick = new ConcreteBrick(objectManager, false);
        
        this._defaultSourceX = this.sourceX;
        this._defaultSourceY = this.sourceY;
    }

    public updatePosition() {
        this._concreteBrick.x = this.x;
        this._concreteBrick.y = this.y;
    }

    public testCollision(entity: Entity): Entity {
        if(this._isConcrete)
            return this._concreteBrick.testCollision(entity);
        else if(this.Visible)
            return super.testCollision(entity);
    }

    public EnableDefence() {
        this._isConcrete = true;
        this.sourceX = this._concreteBrick.sourceX;
        this.sourceY = this._concreteBrick.sourceY;
        super.Repair();
        this.Visible = true;
        setTimeout(() =>{
            this.sourceX = this._defaultSourceX;
            this.sourceY = this._defaultSourceY;
            this._isConcrete = false;
        }, this.defenceTime);
    }

    public die() {
        this.Visible = false;
    }
}

class ConcreteBrick extends Entity {
    constructor (objectManager : ObjectManager, autoAddToManager = true) {
        super(objectManager, 8, 0, 8, 8, autoAddToManager);
        this.Indestructible = true;
    }
    public testCollision(entity: Entity): Entity {
        var e = super.testCollision(entity);
        if (e != null && entity instanceof Bullet) {
            var bullet = <Bullet>entity;
            if (bullet.SuperBullet)
                this.die();
        }
        return e;
    }
}

class MetalBrick extends Entity {
    constructor (objectManager : ObjectManager) {
        super(objectManager, 24, 0, 8, 8);
    }

    public testCollision(entity: Entity): Entity {
        return null;
    }
}
class BushBrick extends Entity {
    constructor (objectManager : ObjectManager){
        super(objectManager, 16, 0, 8, 8);
        this.ZIndex = 3;
    }

    public testCollision(entity: Entity) : Entity {
        return null;
    }
}

class WaterBrick extends Entity {
    private _delay: Timer = new Timer(700);
    private frames = [{ x: 0, y: 8 }, { x: 8, y: 8}];
    private currentFrame = 0;
    constructor (objectManager : ObjectManager) {
        super(objectManager, 0, 8, 8, 8);
    }

    public update() {
        if (this._delay.Interval()) {
            this.currentFrame++;
            if(this.currentFrame >= this.frames.length)
                this.currentFrame = 0;
            this.sourceX = this.frames[this.currentFrame].x;
            this.sourceY = this.frames[this.currentFrame].y;
        }
    }

    public testCollision(entity: Entity) : Entity {
        if(entity instanceof Bullet)
            return null;
        return super.testCollision(entity);
    }
}

class Eagle extends Entity {
    public get IsDestroyed() {
        return this._isDestroyed;
        this.ZIndex = -5;
    }
    private _isDestroyed = false;
    constructor (private objectManager: ObjectManager) {
        super(objectManager, 0, 16, 16, 16);
        this.x = 6 * this.width;
        this.y = 12 * this.height;
    }

    public die() {
        this._isDestroyed = true;
        this.sourceX = 16;
        new Explosion(this.objectManager, this.x + this.width / 2, this.y + this.height / 2);
    }
}

interface IController {
    AssignActor(actor: Actor);
    Update();
}



class SpawnPoint extends Entity{
    private frameDelay: Timer = new Timer(100);
    private respawnTimer:  number = 1500;
    private frames = new Array({ x: 112, y: 32 }, { x: 128, y: 32 });
    private currentFrame = 0;

    constructor (private objectManager: ObjectManager) {
        super(objectManager, 0, 0, 16, 16);
    }

    public update() {
        if (this.Visible) {
            if (this.frameDelay.Interval()) {
                this.currentFrame++;
                if(this.currentFrame >= this.frames.length)
                    this.currentFrame = 0;
            }
            this.sourceX = this.frames[this.currentFrame].x;
            this.sourceY = this.frames[this.currentFrame].y;
        }
    }

    public BeginRespawn() {
        if (!this.IsEmpty()) {
            this.frameDelay.Interval();
            this.Visible = true;

            var _this = this;
            setTimeout(() =>{
                _this.Visible = false;
                _this.spawn();
            }, this.respawnTimer);
        }
    }

    public IsEmpty(): bool {
        return false;
    }

    public spawn() {
    }

    public testCollision(entity: Entity): Entity {
        return null;
    }
}

class EnemySpawnPoint extends SpawnPoint {
    private totalEnemies: number;
    private powerUpSpawner: PowerUpFactory;
    private _lastSpawnPoint = 0;
    private _spawnQueue: number = 0;
    private _lastSpawnTime;
    private _spawnDelay = new Timer(3000);

    public get LastSpawnTime() {
        return this._lastSpawnTime;
    }

    constructor (private objectManager: ObjectManager, private enemyList: string[]) {
        super(objectManager);
        this.BeginRespawn();
        this.totalEnemies = enemyList.length;
        this.powerUpSpawner = new PowerUpFactory(objectManager);
    }

    public spawn() {
        var enemyName = this.enemyList.shift();
        var enemy: Actor = null;

        var enemyIndex = this.totalEnemies - this.enemyList.length;
        var hasPowerUp = (enemyIndex == 4 || enemyIndex == 11 || enemyIndex == 18);
        var controller = new LocalAIController();
        switch (enemyName) {
            case 'Basic':
                enemy = new EnemySmall(this.objectManager, controller, this, hasPowerUp);
            break;
            case 'Fast':
                enemy = new EnemyFast(this.objectManager, controller, this, hasPowerUp);
            break;
            case 'Power':
                enemy = new EnemyPower(this.objectManager, controller, this, hasPowerUp);
            break;
            case 'Armor':
                enemy = new EnemyArmor(this.objectManager, controller, this, hasPowerUp);
            break;
        }
        enemy.x = this.x;
        enemy.y = this.y;
        enemy.angle = 180;
    }

    public BeginRespawn() {
        this._lastSpawnPoint++;
        if(this._lastSpawnPoint >= 3)
            this._lastSpawnPoint = 0;
        this.x = this._lastSpawnPoint * 6 * this.width;
        super.BeginRespawn();
    }
    public update() {
        super.update();

        var enemiesCount = this.objectManager.GetEnemies().length;
        if (enemiesCount < 4 && this._spawnDelay.Interval()) {
            this.BeginRespawn();
        }
       // if (enemiesCount == 0) {
       //     this.e
       // }
    }

    public IsEmpty(): bool {
        return this.enemyList.length == 0;
    }

    public get TanksCount() {
        return this.enemyList.length;
    }

    public GeneratePowerUp() {
        this.powerUpSpawner.GeneratePowerUp();
    }
}

class PlayerSpawnPoint extends SpawnPoint implements IPlayerMemento {
    public PlayerInstance: Player = null;
    public KilledEnemies: string[] = new Array();
    private _points = 0;
    private _cannonPower = 0;
    private get cannonPower() {
        var ret = this._cannonPower;
        this._cannonPower = 0;
        return ret;
    }
    public get PlayerNumber() {
        return this.playerNumber;
    }
    public get Points() : number {
        return this._points;
    }
    public set Points(val: number) {
        this._points = val;
        if(val <= 500 && this._points % 20000 == 0)
            (this).Lives++;
    }

    constructor (private objectManager: ObjectManager, private controller : IController, 
                 public Lives = 3, private playerNumber = 1) {
        super(objectManager);
    }

    public spawn() {
        if (this.Lives >= 0) {
            var player: Player = null;
            if (this.playerNumber == 1) {
                player = new PlayerOne(this.objectManager, this.controller, this);
                
            } else {
                player = new PlayerTwo(this.objectManager, this.controller, this);
            }
            
            player.x = this.x;
            player.y = this.y;
            player.Invulnerable(3000);
            player.CannonEntity.Power = this._cannonPower;

            this.PlayerInstance = player;
        } else {
            this.PlayerInstance = null;
        }
    }

    public SaveState(): PlayerState {
        return new PlayerState(this.PlayerInstance == null ? 0 : this.PlayerInstance.CannonEntity.Power,
                                this.Lives, this.Points);
    }

    public RestoreState(state : PlayerState) {
        if (state != null) {
            this._cannonPower = state.CannonPower;
            this._points = state.Points;
            this.Lives = state.Lives;
        }
    }

    public IsEmpty(): bool {
        return this.Lives < 0;
    }
}

class Explosion extends Entity {
    private frames = Array({ x: 0, y: 32 }, { x: 32, y: 32 }, { x: 64, y: 32 });
    private currentFrame = 0;
    private timerDelay = new Timer(50);

    constructor (objectManager: ObjectManager, x: number, y: number) {
        super(objectManager, 0, 32, 32, 32);

        this.x = x - this.width / 2;
        this.y = y - this.height / 2;

        this.ZIndex = 4;
    }

    public update() {
        if (this.timerDelay.Interval()) {
            this.currentFrame++;
            if (this.currentFrame == this.frames.length) {
                this.die();
                return;
            }
        }
        this.sourceX = this.frames[this.currentFrame].x;
        this.sourceY = this.frames[this.currentFrame].y;
    }

    public testCollision(entity: Entity): Entity {
        return null;
    }
}

class Points extends Entity {
    constructor (objectManager: ObjectManager, x: number, y: number, 
                 private points: number, private display_time = 1000) {
        super(objectManager, 0, 0, 0, 0);
        
        this.x = x;
        this.y = y;

        setTimeout(() =>{
            this.die();
        }, this.display_time);

        this.ZIndex = -10;
    }
    public render(context : CanvasRenderingContext2D) {
        var text_dim = context.measureText(this.points.toString());
        
        context.save();
        context.fillStyle = "white";
        context.fillText(this.points.toString(), this.x - (text_dim.width / 2), this.y);
        context.restore();
    }

    public testCollision(entity: Entity): Entity {
        return null;
    }
}

class Bullet extends Entity {
    private _speed;
    private _collisionHandler: CollisionHandler;
    public SuperBullet = false;

    public get Angle() {
        return this.angle;
    }
    constructor (private objectManager: ObjectManager, private owner: Actor, private _updateCannon : Function) {
        super(objectManager, 16, 8, 8, 8);

        this._collisionHandler = new CollisionHandler(objectManager, this);
        this.angle = owner.angle;
        this.ZIndex = 1;
        this._speed = owner.CannonEntity.BulletsSpeed;
    }

    public update() {
        switch (this.angle) {
            case 0:
                this.y -= this._speed;
            break;
            case 90:
                this.x += this._speed;
            break;
            case 180:
                this.y += this._speed;
            break;
            case 270:
                this.x -= this._speed;
            break;
        }
        var collidedObjects = this._collisionHandler.checkVerticalCollision();
        var collided = false;
        collidedObjects.forEach((object : Entity) =>{
            if (object != this.owner) {
                if (this.owner.GroupId != object.GroupId) {
                    object.HitPoints--;
                    //jesli HP == 0 dodac punkty
                    if (object.GroupId == "Enemy" && this.owner.GroupId == "Player" && object.HitPoints <= 0) {
                        var player = <Player>this.owner;
                        var enemy = <Enemy>object;
                        player.Points += enemy.PointsWorth;
                        player.KilledEnemies.push(enemy.Name);
                        new Points(this.objectManager, enemy.x + (enemy.width / 2),
                                    enemy.y + (enemy.height / 2), enemy.PointsWorth);
                    }
                }
                this.HitPoints--;
            } 
        });
    }

    public testCollision(entity: Entity) : Entity{
        if(entity instanceof Bullet)
            return super.testCollision(entity);
        return null;
    }

    public die() {
        new Explosion(this.objectManager, this.x + (this.width / 2), this.y + (this.height / 2));
        this._updateCannon(this);
        super.die();
    }
}

class Cannon{
    private x: number;
    private y: number;

    private cooldownTimer = new Timer(500);

    private bullets: Bullet[] = new Array();

    public TotalBullets: number = 1;
    public BulletsSpeed: number = 5;
    public Power: number = 0;

    constructor (private owner: Actor, private objectManager : ObjectManager) {
        this.Rotate(owner.angle);
    }

    public Rotate(angle: number) {
        switch (angle) {
            case 0:
                this.x = Math.round(this.owner.width / 2);
                this.y = 0;
            break;
            case 90:
                this.x = this.owner.width;
                this.y = Math.round(this.owner.height / 2);
            break;
            case 180:
                this.x = Math.round(this.owner.width / 2);
                this.y = this.owner.height;
            break;
            case 270:
                this.x = 0;
                this.y = Math.round(this.owner.height / 2);
            break;
        }
    }

    public Shoot() {
        if (this.cooldownTimer.Interval() && this.bullets.length < this.TotalBullets) {
            var bullet = new Bullet(this.objectManager, this.owner, (bullet: Bullet) =>{
                //event handler of exploded bullet
                var index = this.bullets.indexOf(bullet);
                if(index != -1)
                    this.bullets.splice(index, 1);
            });
            bullet.x = this.owner.x + this.x - bullet.width / 2;
            bullet.y = this.owner.y + this.y - bullet.height / 2;

            if(this.Power >= 1)
                this.BulletsSpeed = 7;
            if(this.Power >= 2)
                this.TotalBullets = 2;
            if(this.Power >= 3)
                bullet.SuperBullet = true;

            this.bullets.push(bullet);
        }
    }
}
class Actor extends Entity {
    public Speed: number = 2;

    private collisionHandler: CollisionHandler;
    private cannon: Cannon;

    private _assignedX = false;
    private _assignedY = false;
    private _collisionExcludedEntities : Entity[] = new Array;
    private collidedEntities: Entity[] = new Array();

    public get CollisionExcludes() {
        return this._collisionExcludedEntities;
    }

    public get CannonEntity() {
        return this.cannon;
    }

    public get Spawn() {
        return this.spawnPoint;
    }

    constructor (objectManager: ObjectManager, sourceX: number, sourceY: number,
                 sourceWidth: number, sourceHeight: number, 
                 private controller: IController, private spawnPoint : SpawnPoint) {
        super(objectManager, sourceX, sourceY, sourceWidth, sourceHeight);
        this.controller.AssignActor(this);
        this.collisionHandler = new CollisionHandler(objectManager, this);
        this.cannon = new Cannon(this, objectManager);

        this.ZIndex = 1;
    }

    public update() {
        this.updateCollisionExcludes(this.collisionHandler.checkVerticalCollision());
        this.controller.Update();
    }

    public MoveHorizontal(deltaX : number) {
        if(deltaX < 0)
            this.rotateLeft();
        else
            this.rotateRight();

        this.x += deltaX * this.Speed;
        
        var collidedEntity = this.updateCollisionExcludes(this.collisionHandler.checkVerticalCollision());
        if (collidedEntity.length > 0) {
            if(deltaX < 0)
                this.MoveTo(collidedEntity[0].x + collidedEntity[0].width, this.y);
            else
                this.MoveTo(collidedEntity[0].x - this.width, this.y);
            return false;
        }
        return true;
    }

    public MoveVertical(deltaY : number) {
        if(deltaY < 0)
            this.rotateUp();
        else
            this.rotateDown();

        this.y += deltaY * this.Speed;

        var collidedEntity = this.updateCollisionExcludes(this.collisionHandler.checkVerticalCollision());
        if (collidedEntity.length > 0) {
            if(deltaY < 0)
                this.MoveTo(this.x, collidedEntity[0].y + collidedEntity[0].height);
            else
                this.MoveTo(this.x, collidedEntity[0].y - this.height);
            return false;
        }
        return true;
    }

    public MoveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public updateRotation() {
        this.cannon.Rotate(this.angle);
    }

    private updateCollisionExcludes(collidedEntity : Entity[]) {
        var elementsToRemove: number[] = new Array();
        this._collisionExcludedEntities.forEach((excluded: Entity, index) =>{
            var i = collidedEntity.indexOf(excluded);
            if(i == -1)
                elementsToRemove.push(index);
        });
        elementsToRemove.forEach((index) =>{
            this._collisionExcludedEntities.splice(index, 1);
        });

        var _this = this;
        return collidedEntity.filter(function(i) {return !(_this._collisionExcludedEntities.indexOf(i) > -1);});
    }

    public updatePosition() {
        if ((!this._assignedX)&&(!this._assignedY)) {
            this._collisionExcludedEntities = this.collisionHandler.checkVerticalCollision();
        }

        if(this.x != 0)
            this._assignedX = true;
        if(this.y != 0)
            this._assignedY = true;
    }

    public Shoot() {
        this.cannon.Shoot();
    }

    public testCollision(entity: Entity): Entity {
        var e = super.testCollision(entity);
        if(this._collisionExcludedEntities.indexOf(entity) > -1)
            return null;
        return e;
    }
}

class CollisionHandler {
    private excludedEntites: Entity[] = new Array();

    constructor (private objectManager: ObjectManager, private actor : Entity) {
    }

    public checkVerticalCollision() {
        var collidedEntities = new Array();
        this.objectManager.GetEntities().forEach((entity: Entity) =>{
            if (entity != this.actor) {
                var c = entity.testCollision(this.actor);
                if (c != null) {
                    collidedEntities.push(c);
                }
            }
        });
        return collidedEntities;
    }
}

class PlayerState {
    constructor (private _cannonPower: number, private _lives: number, private _points: number) {
    }

    public get CannonPower() {
        return this._cannonPower;
    }

    public get Lives() {
        return this._lives;
    }

    public get Points() {
        return this._points;
    }
}

interface IPlayerMemento {
    SaveState(): PlayerState;
    RestoreState(state: PlayerState);
}

class Player extends Actor {
    private shieldFrames = new Array({ x: 112, y: 48 }, { x: 128, y: 48 });
    private shieldAnimationDelay = new Timer(50);
    private currentFrame = 0;

    public get PlayerNumber() {
        return this._playerNumber;
    }

    public get KilledEnemies() : string[]{
        return (<PlayerSpawnPoint>this.Spawn).KilledEnemies;
    }

    public get Points() : number {
        return (<PlayerSpawnPoint>this.Spawn).Points;
    }
    public set Points(val: number) {
        (<PlayerSpawnPoint>this.Spawn).Points = val;
    }

    public get Lives() {
        return (<PlayerSpawnPoint>this.Spawn).Lives;
    }
    public set Lives(val: number) {
        (<PlayerSpawnPoint>this.Spawn).Lives = val;
    }

    constructor (objectManager: ObjectManager, sourceX: number, sourceY: number, 
                 controller: IController, spawnPoint: PlayerSpawnPoint, private _playerNumber = 1) {
        super(objectManager, sourceX, sourceY, 16, 16, controller, spawnPoint);

        this.GroupId = "Player";
    }

    public rotateLeft() {
        if(this.angle == 270)
            return;
        this.angle = 270;
        this.tileY = this.tileY;
    }

    public rotateRight() {
        if(this.angle == 90)
            return;
        this.angle = 90;
        this.tileY = this.tileY;
    }

    public rotateUp() {
        if(this.angle == 0)
            return;
        this.angle = 0;
        this.tileX = this.tileX;
    }

    public rotateDown() {
        if(this.angle == 180)
            return;
        this.angle = 180;
        this.tileX = this.tileX;
    }

    public render(context: CanvasRenderingContext2D) {
        super.render(context);
        if (this.Indestructible) {
            if(this.shieldAnimationDelay.Interval()) {
                this.currentFrame++;
                if(this.currentFrame >= this.shieldFrames.length)
                    this.currentFrame = 0;
            }
            context.drawImage(this.objectManager.Texture,
                                this.shieldFrames[this.currentFrame].x,
                                this.shieldFrames[this.currentFrame].y,
                                16, 16,
                                this.x, this.y,
                                this.width, this.height
                                );
        }
    }
    public Invulnerable(time = 3000) {
        this.Indestructible = true;
        setTimeout(() =>{
            this.Indestructible = false;
        }, time);
    }

    public die() {
        this.Lives--;
        this.Spawn.BeginRespawn();
        super.die();
    }
}

class PlayerOne extends Player {
    constructor (objectManager: ObjectManager, controller: IController, spawnPoint: PlayerSpawnPoint) {
        super(objectManager, 96, 32, controller, spawnPoint, 1);
    }
}

class PlayerTwo extends Player {
    constructor (objectManager: ObjectManager, controller: IController, spawnPoint: PlayerSpawnPoint) {
        super(objectManager, 96, 48, controller, spawnPoint, 2);
    }
}

class Enemy extends Actor {
    private blinkDelay = new Timer(300);
    private animationState = -1;
    public Name = "Enemy";
    public PointsWorth = 0;

    constructor(objectManager: ObjectManager, sourceX: number, sourceY: number, sourceWidth: number,
                sourceHeight: number, controller: IController, private spawnPoint: EnemySpawnPoint, public HasPowerUp = false) {
        super(objectManager, sourceX, sourceY, sourceWidth, sourceHeight, controller, spawnPoint);
    }

    public update() {
        if (this.HasPowerUp && this.blinkDelay.Interval()) {
            this.sourceY += this.animationState * this.sourceHeight;
            this.animationState *= -1;
        }
        super.update();
    }

    public Freeze(time: number = 5000) {
        this.Active = false;
        var _this = this;
        setTimeout(() =>{ _this.Active = true }, time);
    }

    public die() {
        new Explosion(this.objectManager, this.x + this.width / 2, this.y + this.height / 2);
        if(this.HasPowerUp)
            this.spawnPoint.GeneratePowerUp();
        super.die();
    }
}

class EnemySmall extends Enemy {
    constructor (objectManager: ObjectManager, controller: IController, spawnPoint: EnemySpawnPoint, HasPowerUp: bool ) {
        super(objectManager, 32, 16, 16, 16, controller, spawnPoint, HasPowerUp);
        this.GroupId = "Enemy";
        this.Name = "Small";
        this.PointsWorth = 100;
        this.Speed = 1;
    }
}

class EnemyFast extends Enemy{
    constructor (objectManager: ObjectManager, controller: IController, spawnPoint: EnemySpawnPoint, HasPowerUp: bool) {
        super(objectManager, 48, 16, 16, 16, controller, spawnPoint, HasPowerUp);
        this.GroupId = "Enemy";
        this.Name = "Fast";
        this.PointsWorth = 200;
        this.Speed = 3;
    }
}

class EnemyPower extends Enemy {
    constructor (objectManager: ObjectManager, controller: IController, spawnPoint: EnemySpawnPoint, HasPowerUp: bool) {
        super(objectManager, 64, 16, 16, 16, controller, spawnPoint, HasPowerUp);
        this.GroupId = "Enemy";
        this.Name = "Power";
        this.PointsWorth = 300;
        this.CannonEntity.BulletsSpeed = 7;
        this.Speed = 1;
    }
}

class EnemyArmor extends Enemy {
    constructor (objectManager: ObjectManager, controller: IController, spawnPoint: EnemySpawnPoint, HasPowerUp: bool) {
        super(objectManager, 80, 16, 16, 16, controller, spawnPoint, HasPowerUp);
        this.GroupId = "Enemy";
        this.Name = "Armor";
        this.PointsWorth = 400;
        this.HitPoints = 4;
        this.Speed = 1;
    }
}

class ObjectManager {
    public get ScreenWidth() {
        return this.canvas.width;
    }
    public get ScreenHeight() {
        return this.canvas.height;
    }

    public get Texture() {
        return this.texture;
    }

    private context: CanvasRenderingContext2D;
    private entityList: Entity[] = new Array();
    
    constructor (private texture: HTMLImageElement, private canvas: HTMLCanvasElement) {
        this.context = canvas.getContext("2d");
        this.context.font = "16px Press Start 2P";
    }

    public AddEntity(entity: Entity) {
        this.entityList.push(entity);
        this.entityList = this.entityList.sort((a, b) =>{
            return a.ZIndex - b.ZIndex;
        });
    }

    public RemoveEntity(entity: Entity) {
        var i = this.entityList.indexOf(entity);
        if (i != -1) {
            this.entityList.splice(i, 1);
        }
    }

    public GetEntities() {
        return this.entityList;
    }

    public GetEnemies() {
        var output = new Array();
        this.entityList.forEach((entity: Entity) =>{
            if(entity instanceof EnemySmall ||
               entity instanceof EnemyFast ||
               entity instanceof EnemyPower ||
               entity instanceof EnemyArmor)
                output.push(entity);
        });
        return output;
    }

    public GetEnemySpawnPoints() {
        var output = null;
        this.entityList.forEach((entity: Entity) =>{
            if (entity instanceof EnemySpawnPoint)
                output = entity;
        });
        return output;
    }

    public GetPlayerSpawnPoints() {
        var output = new Array();
        this.entityList.forEach((entity: Entity) =>{
            if (entity instanceof PlayerSpawnPoint)
                output.push(entity);
        });
        return output.sort((a: PlayerSpawnPoint, b: PlayerSpawnPoint) =>{
            return a.PlayerNumber - b.PlayerNumber;
        });
    }

    public GetPlayers(){
        var output = new Array();
        this.entityList.forEach((entity: Entity) =>{
            if(entity instanceof Player)
                output.push(entity);
        });
        return output.sort((a: Player, b: Player) =>{
            return a.PlayerNumber - b.PlayerNumber;
        });
    }

    public GetEagle() {
        var output = null;
        this.entityList.forEach((entity: Entity) =>{
            if(entity instanceof Eagle)
                output = entity;
        });
        return output;
    }

    public GetDefenceBricks() {
        var output = new Array();
        this.entityList.forEach((entity: Entity) =>{
            if (entity instanceof DefenceBrick)
                output.push(entity);
        });
        return output;
    }

    public Process() {
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.entityList.length; i++) {
            if (this.entityList[i].Active)
                this.entityList[i].update();
        }
        for (var i = 0; i < this.entityList.length; i++) {
            this.entityList[i].render(this.context);
        }
    }

    public Clear() {
        this.entityList.splice(0, this.entityList.length);
    }
}

class MapContainer {
    private tiles = Array();
    private mapSide = 26;
    private map : string;
    private spawnFactory : SpawnFactory;

    constructor(map : IMapDefinition,  private objectManager : ObjectManager, private playerCount: number,
                playersState : ILevelCompleteResult[]) {
        this.map = map.Definition;
        this.spawnFactory = new SpawnFactory(this.objectManager, map.EnemyList, playersState);
        if(this.map.length != this.mapSide * this.mapSide)
            throw "Map file has invalid length.";
        this.createTiles();
        MapBorder.GenerateBorders(objectManager);
    }

    public getAllTiles() : Entity[] {
        return this.tiles;
    }

    private createTiles() {
        if (this.tiles.length == 0) {
            for (var y = 0; y < this.mapSide; y++)
                for (var x = 0; x < this.mapSide; x++) {
                    var pointer = y * this.mapSide + x;
                    var tileId = this.map.charAt(pointer);
                    var tile : Entity = null;

                    switch (tileId) {
                        case '#':
                            tile = new WallBrick(this.objectManager);
                        break;
                        case '@':
                            tile = new ConcreteBrick(this.objectManager);
                        break;
                        case '%':
                            tile = new BushBrick(this.objectManager);
                        break;
                        case '!':
                            tile = new DefenceBrick(this.objectManager);
                        break;
                        case '~':
                            tile = new WaterBrick(this.objectManager);
                        break;
                        case '-':
                            tile = new MetalBrick(this.objectManager);
                        break;
                    }

                    if (tile != null) {
                        tile.x = tile.width * x;
                        tile.y = tile.height* y;

                        this.tiles.push(tile);
                    }
                }
            new Eagle(this.objectManager);
            this.spawnFactory.AddEnemySpawns();
            this.spawnFactory.AddPlayersSpawns(this.playerCount == 2);
        }
    }
}

class KeyboardHandler {
    private static _keysPressed: number[] = new Array();
    
    public static IsKeyPressed(key: number) {
        return this._keysPressed.indexOf(key) != -1;
    }

    //EventHandlers
    public static KeyDown(code) {
        var i = this._keysPressed.indexOf(code);
        if(i == -1)
            this._keysPressed.push(code);
        else
            this._keysPressed[i] = code;
    }

    public static KeyUp(code) {
        var i = this._keysPressed.indexOf(code);
        if(i != -1)
            this._keysPressed.splice(i, 1);
    }
}

class LocalPlayerOneController implements IController {
    private actor: Actor = null;

    public AssignActor(actor: Actor) {
        this.actor = actor;
    }

    public Update() {
        if(this.actor == null)
            throw "Actor must be assigned to controller before calling Update()";

        if (KeyboardHandler.IsKeyPressed(65))  //Move left
            this.actor.MoveHorizontal(-1);
        else if(KeyboardHandler.IsKeyPressed(68)) //Move right
            this.actor.MoveHorizontal(1);
        else if(KeyboardHandler.IsKeyPressed(87)) //Move up
            this.actor.MoveVertical(-1);
        else if(KeyboardHandler.IsKeyPressed(83)) //Move down
            this.actor.MoveVertical(1);

        if(KeyboardHandler.IsKeyPressed(32))
            this.actor.Shoot();
    }
}

class LocalPlayerTwoController implements IController {
    private actor: Actor = null;

    public AssignActor(actor: Actor) {
        this.actor = actor;
    }

    public Update() {
        if(this.actor == null)
            throw "Actor must be assigned to controller before calling Update()";

        if (KeyboardHandler.IsKeyPressed(37))  //Move left
            this.actor.MoveHorizontal(-1);
        else if(KeyboardHandler.IsKeyPressed(39)) //Move right
            this.actor.MoveHorizontal(1);
        else if(KeyboardHandler.IsKeyPressed(38)) //Move up
            this.actor.MoveVertical(-1);
        else if(KeyboardHandler.IsKeyPressed(40)) //Move down
            this.actor.MoveVertical(1);

        if(KeyboardHandler.IsKeyPressed(191))
            this.actor.Shoot();
    }
}

class PowerUp extends Entity {
    constructor (objectManager: ObjectManager, sourceX, sourceY) {
        super(objectManager, sourceX, sourceY, 16, 15);
        this.ZIndex = 1;
        setInterval(() =>{
            this.Visible = ! this.Visible;
        }, 500);
    }

    //TODO: dodac obsluge 2 playera
    public testCollision(entity: Entity): Entity {
        var e = super.testCollision(entity);
        if (e != null && entity.GroupId == "Player") {
            this.FirePowerUp(<PlayerOne>entity);
            (<Player>entity).Points += 500;
            this.die();
        }
        return null;
    }

    public FirePowerUp(player: PlayerOne) {
    }
}

class PowerExtraLife extends PowerUp {
    constructor (objectManager: ObjectManager) {
        super(objectManager, 112, 15);
    }

    public FirePowerUp(player: Player) {
        (<PlayerSpawnPoint>player.Spawn).Lives++;
    }
}

class PowerAttack extends PowerUp {
    constructor (objectManager: ObjectManager) {
        super(objectManager, 96, 15);
    }

    public FirePowerUp(player: Player) {
        player.CannonEntity.Power++;
    }
}

class PowerDefence extends PowerUp {
    constructor (private objectManager: ObjectManager) {
        super(objectManager, 128, 0);
    }

    public FirePowerUp(player: Player) {
        var defenceBricks : DefenceBrick[] = this.objectManager.GetDefenceBricks();
        defenceBricks.forEach((brick) =>{
            brick.EnableDefence();
        });
    }
}

class PowerWipeEnemies extends PowerUp {
    constructor (private objectManager: ObjectManager) {
        super(objectManager, 96, 0);
    }

    public FirePowerUp(player: Player) {
        this.objectManager.GetEnemies().forEach((enemy: Enemy) =>{
            enemy.die();
        });
    }
}

class PowerFreezeEnemies extends PowerUp {
    constructor (objectManager: ObjectManager) {
        super(objectManager, 128, 15);
    }

    public FirePowerUp(player: Player) {
        this.objectManager.GetEnemies().forEach((enemy: Enemy) =>{
            enemy.Freeze();
        });
    }
}

class PowerShield extends PowerUp {
    constructor (objectManager: ObjectManager) {
        super(objectManager, 112, 0);
    }

    public FirePowerUp(player: Player) {
        player.Invulnerable(5000);
    }
}

class PowerUpFactory {
    private currentPowerUp = null;

    constructor (private objectManager: ObjectManager) {
    }

    public GeneratePowerUp() {
        this.objectManager.RemoveEntity(this.currentPowerUp);
        this.currentPowerUp = null;

        var coords = new Array(3, 9, 15, 21);
        var indexX: number = Math.round(Math.random() * (coords.length - 1));
        var indexY: number = Math.round(Math.random() * (coords.length - 1));
        var powerUpId = Math.round(Math.random() * 5);
        
        switch (powerUpId) {
            case 0:
                this.currentPowerUp = new PowerExtraLife(this.objectManager);
            break;
            case 1:
                this.currentPowerUp = new PowerDefence(this.objectManager);
            break;
            case 2:
                this.currentPowerUp = new PowerAttack(this.objectManager);
            break;
            case 3:
                this.currentPowerUp = new PowerFreezeEnemies(this.objectManager);
            break;
            case 4:
                this.currentPowerUp = new PowerWipeEnemies(this.objectManager);
            break;
            case 5:
                this.currentPowerUp = new PowerShield(this.objectManager);
            break;
        }

        this.currentPowerUp.x = coords[indexX] * this.currentPowerUp.width / 2;
        this.currentPowerUp.y = coords[indexY] * this.currentPowerUp.height / 2;
    }
}

class LocalAIController implements IController {
    private actor: Actor = null;
    private movementFunctions: Function[] = new Array();
    
    private currentMovement: number = 0;
    private currentDirection: number = 1;

    private lastTileX: number = 0;
    private lastTileY: number = 0;

    public AssignActor(actor: Actor) {
        this.actor = actor;

        this.movementFunctions[0] = this.actor.MoveVertical;
        this.movementFunctions[1] = this.actor.MoveHorizontal;

        this.lastTileX = actor.tileX;
        this.lastTileY = actor.tileY;
    }

    public Update() {
        var result = this.movementFunctions[this.currentMovement].call(this.actor, [this.currentDirection]);
        if (!result) {
            this.chooseNewDirection();
        } else {
            var chance = Math.round(Math.random() * 100);
            
            if (chance < 20 &&
                this.actor.x / 16 == Math.round(this.actor.x / 16) &&
                this.actor.y / 16 == Math.round(this.actor.y / 16)) {

                this.chooseNewDirection();

                this.lastTileX = this.actor.tileX;
                this.lastTileY = this.actor.tileY;
            }

        }
        this.actor.Shoot();
    }

    private chooseNewDirection() {
        this.currentMovement = Math.round(Math.random());
        this.currentDirection = Math.round(Math.random()) == 0 ? -1 : 1;
    }
}

class SpawnFactory {
    constructor (private objectManager : ObjectManager, private spawnSettings: any[],
                 private _playersState : ILevelCompleteResult[]) {
    }

    public AddEnemySpawns(){
        new EnemySpawnPoint(this.objectManager, this.spawnSettings);
    }

    public AddPlayersSpawns(twoPlayers = false) {
        var state = null;

        
        var total = twoPlayers ? 2 : 1;
        for (var i = 0; i < total; i++) {
            var spawn :PlayerSpawnPoint = null; 

            if (i == 1) {
                spawn = new PlayerSpawnPoint(this.objectManager,
                    new LocalPlayerTwoController(), 3, 2);
                spawn.x = spawn.width * 8;
                spawn.y = spawn.height * 12;
            } else {
                spawn = new PlayerSpawnPoint(this.objectManager,
                    new LocalPlayerOneController(), 3);
                spawn.x = spawn.width * 4;
                spawn.y = spawn.height * 12;
            }

            if (this._playersState != null) {
                this._playersState.forEach((value) =>{
                    if(i == 1 && value.PlayerNumber == 2)
                        spawn.RestoreState(value.State);
                    if(i == 0 && value.PlayerNumber == 1)
                        spawn.RestoreState(value.State);
                });
            }

            spawn.BeginRespawn();
        }
    }
}

interface IMapDefinition {
    Definition: string;
    EnemyList: string[];
}

class MapRequester {
    constructor (private url: string) {
        $.ajaxSetup({ async: false });
    }

    public GetMapDefinition(index: number) : IMapDefinition{
        var output : string = null;

        $.get(this.url + "GetLevelDefinition.php?index=" + index.toString(), (data) =>{
            output = data;
        });

        if(output == null || output == "Error")
            throw "Unable to fetch map from remote server.";

        var params = output.split(';');
        var enemyList = params[1].replace(/[\n\r]/g, '').split(',');
        return { Definition: params[0], EnemyList: enemyList };
    }

    public GetMapsCount() {
        var output = 0;

        $.get(this.url + "GetMapCount.php", function (data) {
            output = parseInt(data);
        });

        return output;
    }
}

class Game {
    private objectManager: ObjectManager;
    private intervalId : number;
    private playerSpawns: PlayerSpawnPoint[];
    private enemySpawn: EnemySpawnPoint;
    private eagle: Eagle;
    private levelIndex = 1;
    private callbackCalled = false;

    public CallbackGameOver: Function = () =>{ throw "GameOver callback not assigned"; };
    public CallbackLevelComplete: Function = () =>{ throw "LevelComplete callback not assigned"; };
    public CallbackUpdateHUD: Function = () =>{ throw "HUDUpdate callback not assigned" };

    constructor (canvas: HTMLCanvasElement, texture: HTMLImageElement, private mapRequester:MapRequester) {
        this.objectManager = new ObjectManager(texture, canvas);
    }

    public StartLevel(levelIndex: number, playersCount:number, players_state: ILevelCompleteResult[] = null) {
        if (levelIndex > this.mapRequester.GetMapsCount()) {
            this.levelIndex = levelIndex % this.mapRequester.GetMapsCount();
        }else
            this.levelIndex = levelIndex;

        this.objectManager.Clear();

        var mapDefinition = this.mapRequester.GetMapDefinition(this.levelIndex);
        var map = new MapContainer(mapDefinition, this.objectManager, playersCount, players_state);
        
        this.playerSpawns = this.objectManager.GetPlayerSpawnPoints();
        this.enemySpawn = this.objectManager.GetEnemySpawnPoints();
        this.eagle = this.objectManager.GetEagle();

        this.intervalId = setInterval(() =>{
            this.loop();
        }, 17);
    }

    private loop() {
        this.objectManager.Process();

        //Players dead
        var zeroLifes = 0;
        this.playerSpawns.forEach((spawn) =>{
            if(spawn.Lives < 0)
                zeroLifes++;
        });
        if(zeroLifes == this.playerSpawns.length || this.eagle.IsDestroyed)
            this.gameOver();
        //Enemies dead
        if(this.enemySpawn.IsEmpty()&&this.objectManager.GetEnemies().length == 0)
            this.stageClear();

        //update HUD
        var playerOneLifes = this.playerSpawns[0].Lives;
        var playerTwoLifes = this.playerSpawns.length > 1? this.playerSpawns[1].Lives: -1;
        this.CallbackUpdateHUD(this.levelIndex, this.enemySpawn.TanksCount, playerOneLifes, playerTwoLifes);
    }

    private gameOver() {
        if (!this.callbackCalled) {
            var results: IGameOverResult[] = new Array();
            this.playerSpawns.forEach((spawn) =>{
                results.push({
                    PlayerNumber: spawn.PlayerNumber,
                    Points: spawn.Points,
                    EnemiesKilled: spawn.KilledEnemies,
                    Stage: this.levelIndex
                });
            });

            this.CallbackGameOver(results);
            this.callbackCalled = true;
        }
    }

    private stageClear() {
        if (!this.callbackCalled) {
            var results: ILevelCompleteResult[] = new Array();
            this.playerSpawns.forEach((spawn) =>{
                results.push({
                    PlayerNumber: spawn.PlayerNumber,
                    Points: spawn.Points,
                    EnemiesKilled: spawn.KilledEnemies,
                    Stage: this.levelIndex,
                    State: spawn.SaveState()
                });
            });

            this.CallbackLevelComplete(results);
            this.callbackCalled = true;
        }
    }

    public Stop() {
        clearInterval(this.intervalId);
    }
}