Game = function () {
    var self = this;
    //Create a container object called the `stage`

    this.mainContainer = new PIXI.Container();
    //Tell the `renderer` to `render` the `stage`
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {antialias: false, transparent: false, resolution: 1, view: document.getElementById("renderer")});
    this.renderer.autoResize = true;
    this.fullScreen = false;
    //this.loader = new Game.Loader();

    $("#preloader").on("done", function (event, content) {
        /**
         *
         * @type {Game.Map}
         */
        self.map = new Game.Map(self, content);
        self.helper = new Game.Helper(self);
        MainLoop.setUpdate(self.update).setDraw(self.draw).start();
    });
    //this.loader.pl.once('complete',onAssetsLoaded);

    this.update = function(delta) {

    };
    this.draw = function() {
        self.renderer.render(self.mainContainer);
    };


};