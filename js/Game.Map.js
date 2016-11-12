Game.Map = function (game, tmx) {
    this.tmx = tmx;
    this.game = game;
    this.mapContainer = new PIXI.Container();
    this.streetsContainer = new PIXI.Container();
    this.buildingsContainer = new PIXI.Container();

    //pixi container for each layer (created by "CreateContainers)
    this.layerContainers = {};
    this.layers = ['Bottom', 'Top'];
    //tmx layers (created by get layers)
    this.oLayers = [];
    this.GetLayers(this.layers);
    // var that = this;
    this.mapContainer.interactive = true;
    this.mouseHandler = new Game.Map.MouseHandler(this);
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;

    this.mapContainer.addChild(this.streetsContainer);
    this.mapContainer.addChild(this.buildingsContainer);
    game.mainContainer.addChild(this.mapContainer);
};
Game.Map.prototype.GetLayer = function (name) {
    for(var iLayer = 0; iLayer < this.tmx.layers.length; iLayer++) {
        var oLayer = this.tmx.layers[iLayer];
        if(oLayer.name == name) {
            return oLayer;
        }
    }
};
Game.Map.prototype.GetLayers = function (layers) {
    for(var iLayer = 0; iLayer < layers.length; iLayer++) {
        this.oLayers.push(this.GetLayer(layers[iLayer]));
    }
    this.CreateContainers();
};
Game.Map.prototype.CreateContainers = function () {
    for(var iLayer = 0; iLayer < this.oLayers.length; iLayer++) {
        var name = this.oLayers[iLayer].name;
        this.layerContainers[name] = new PIXI.Container();
    }
    this.RenderLayers();
};
Game.Map.prototype.getTileset = function (gid) {
    for (var iTilesetCounter = 0, len = this.tmx.tilesets.length - 1; iTilesetCounter <= len; iTilesetCounter++) {
        if (gid >= this.tmx.tilesets[iTilesetCounter].firstGid && (undefined == this.tmx.tilesets[iTilesetCounter + 1] || gid < this.tmx.tilesets[iTilesetCounter + 1].firstGid)) {
            return this.tmx.tilesets[iTilesetCounter];
        }
    }
    return false;
};
Game.Map.prototype.RenderLayers = function () {


    for (var iSet = 0; iSet < this.layers.length; iSet++) {
        var layer = this.oLayers[iSet];
        for (var iX = 0, iXLen = layer.width; iX < iXLen; iX++) {
            for (var iY = 0, iYLen = layer.height; iY < iYLen; iY++) {

                var gid = 0;
                if (undefined === layer.data[iY] || undefined === layer.data[iY][iX]) {
                    // does not exist
                } else {
                    gid = layer.data[iY][iX];
                }
                if (gid == 0) {
                    continue;
                }
                var tileSet = this.getTileset(gid);
                gid -= tileSet.firstGid - 1;
                var tileAmountWidth = Math.floor(tileSet.width / tileSet.tilewidth);
                var spriteY = Math.ceil(gid / tileAmountWidth) - 1;
                var spriteX = (gid - ((tileAmountWidth) * spriteY) - 1);
                var tileFrame = new PIXI.Rectangle(spriteX * tileSet.tilewidth, spriteY * tileSet.tileheight, tileSet.tilewidth, tileSet.tileheight);
                var tileTexture = new PIXI.Texture(preloader.pl.resources[tileSet.name].texture, tileFrame);
                var tile = new PIXI.Sprite(tileTexture);
                tile.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                tile.position.x = (iX * tileSet.tilewidth);
                tile.position.y = (iY * tileSet.tileheight);
                this.layerContainers[layer.name].addChild(tile);
            }
        }
        this.mapContainer.addChild(this.layerContainers[layer.name]);
    }
};


Game.Map.prototype.ConstrainMove = function () {
    var newX = this.mapContainer.position.x + this.offsetX;
    newX = Math.max(newX, -1 * this.tmx.map.tileWidth * this.tmx.map.width * this.scale + this.game.renderer.width);
    newX = Math.min(newX, 0);

    var newY = this.mapContainer.position.y + this.offsetY;
    newY = Math.max(newY, -1 * this.tmx.map.tileHeight * this.tmx.map.height * this.scale + this.game.renderer.height);
    newY = Math.min(newY, 0);
    this.mapContainer.position.x = newX;
    this.mapContainer.position.y = newY;
};

Game.Map.prototype.isZoomable = function (newScale) {
    if((this.tmx.map.tileWidth * this.tmx.map.width * newScale) < this.game.renderer.width ||  (this.tmx.map.tileHeight * this.tmx.map.height * newScale) < this.game.renderer.height) {
        return false;
    }
    return true;
};