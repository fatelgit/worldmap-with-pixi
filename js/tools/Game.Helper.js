Game.Helper = function (game) {
    this.game = game;
};

Game.Helper.prototype.toggleFullScreen = function () {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        this.game.fullScreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        this.game.fullScreen = false;
    }
    if(this.game.fullScreen) {
        this.game.renderer.resize(window.screen.availWidth, window.screen.availHeight);
    } else {
        this.game.renderer.resize(window.innerWidth, window.innerHeight);
    }
};

Game.Helper.prototype.resizeRenderer = function () {
    this.game.renderer.resize(window.innerWidth, window.innerHeight);
    this.game.map.ConstrainMove();
};