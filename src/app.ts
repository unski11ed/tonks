import { ScreenGame } from './screens/screenGame';
import { ScreenLevelSelect } from './screens/screenLevelSelect';
import { ScreenMainMenu } from './screens/screenMainMenu';
import { ScreenResults } from './screens/screenResults';
import { ScreenManager } from './screens/screenManager';
import { KeyboardHandler } from './game/controllers/keyboardHandler';
import $ from 'jquery';

(() => {
    $(document).keydown((e) => KeyboardHandler.keyDown(e.keyCode));
    $(document).keyup((e) => KeyboardHandler.keyUp(e.keyCode));

    const screenManager = new ScreenManager();
    const screenMainMenu = new ScreenMainMenu(screenManager, $('#screen--main-menu'));
    const screenLevelSelect = new ScreenLevelSelect(
        screenManager,
        $('#screen--level-selection'),
        $('#texture')[0] as HTMLImageElement,
        $('#screen--game canvas')[0] as HTMLCanvasElement,
    )
    const screenGame = new ScreenGame(screenManager, $('#screen--game'));
    const screenResults = new ScreenResults(screenManager, $('#screen-results'));

    screenManager.add(screenMainMenu);
    screenManager.add(screenLevelSelect);
    screenManager.add(screenGame);
    screenManager.add(screenResults);

    screenManager.setScreen('MainMenu', {});
})();
