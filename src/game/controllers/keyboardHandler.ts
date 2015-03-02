export class KeyboardHandler {
    private static _keysPressed: number[] = new Array();
    
    public static isKeyPressed(key: number) {
        return this._keysPressed.indexOf(key) != -1;
    }

    //EventHandlers
    public static keyDown(code: number) {
        var i = this._keysPressed.indexOf(code);
        if(i == -1)
            this._keysPressed.push(code);
        else
            this._keysPressed[i] = code;
    }

    public static keyUp(code: number) {
        var i = this._keysPressed.indexOf(code);
        if(i != -1)
            this._keysPressed.splice(i, 1);
    }
}