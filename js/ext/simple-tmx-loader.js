var SimpleTmxLoader = function (sPath, callback)
{
    this.sPath = sPath;
    this.callback = callback;
    this.tmxContent = {};


    this.Load();
};

SimpleTmxLoader.Map = function($map)
{
    return {
        width: parseInt($map.attr("width"), 10),
        height: parseInt($map.attr("height"), 10),
        tileWidth: parseInt($map.attr("tilewidth"), 10),
        tileHeight: parseInt($map.attr("tileheight"), 10),
        nextObjectId: parseInt($map.attr("nextobjectid"), 10),
        version: $map.attr("version"),
        orientation: $map.attr("orientation"),
        renderorder: $map.attr("renderorder")
    }
};


SimpleTmxLoader.Tileset = function(firstGid, name, tilewidth, tileheight, src, width, height, properties)
{
    return {
        firstGid: firstGid,
        name: name,
        tilewidth: tilewidth,
        tileheight: tileheight,
        src: src,
        width: width,
        height: height,
        properties: properties
    }
};
SimpleTmxLoader.Object = function(x, y, width, height, properties, gid, name)
{
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        properties: properties,
        gid: gid,
        name: name
    }
};
SimpleTmxLoader.Layer = function(name, width, height, data, properties)
{
    this.parsedData = new Array(height);
    this.width = width;
    this.height = height;

    for (var d = 0; d < height; ++d) {
        this.parsedData[d] = new Array(width);
    }
    this.loadCSV(data);
    return {
        name: name,
        width: this.width,
        height: this.height,
        data: this.parsedData,
        properties: properties
    }
};

SimpleTmxLoader.Layer.prototype.trim = function(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

SimpleTmxLoader.Layer.prototype.loadCSV = function (data) {
    var layerData = this.trim(data).split('\n');
    for (var x = 0; x < layerData.length; ++x) {
        var line = this.trim(layerData[x]);
        var entries = line.split(',');
        for (var e = 0; e < this.width; ++e) {
            this.parsedData[x][e] = entries[e];
        }
    }
};
SimpleTmxLoader.prototype.parseProperties = function ($xml) {
    var properties = {};
    var aEle = $xml.find('*').filterNode("property");
    for (var i = 0, t; t = aEle[i]; i++) {

        var $ele = $(t);
        properties[$ele.attr("name").toString()] = $ele.attr("value");
    }
    return properties;
};

SimpleTmxLoader.prototype.parseLayers = function (aLayers)
{
    this.tmxContent.layers = [];

    for (var iLayer = 0, tLayer; tLayer = aLayers[iLayer]; iLayer++) {
        var $Layer = $(tLayer);
        var $data = $Layer.find("data");
        var name = $Layer.attr("name");
        //var $properties = $Layer.find("properties");
        var properties = this.parseProperties($Layer);
        var width = parseInt($Layer.attr("width"), 10);
        var height = parseInt($Layer.attr("height"), 10);
        var data = null;

        if ($data.attr("encoding") == "csv") {
            data = $data.text();
        } else {
            console.log("Unsupported TMX encoding - please encode your file using CSV.");
        }

        if(data != null) {
            this.tmxContent.layers.push(new SimpleTmxLoader.Layer(name, width, height, data, properties));
        }

    }

};
SimpleTmxLoader.prototype.parseTilesets = function (aTileSets)
{
    this.tmxContent.tilesets = [];

    for (var iTileSets = 0, oTileset; oTileset = aTileSets[iTileSets]; iTileSets++) {
        var $tileSet = $(oTileset);
        var firstGid = parseInt($tileSet.attr("firstgid"), 10);
        var name = $tileSet.attr("name");
        var tilewidth = parseInt($tileSet.attr("tilewidth"), 10);
        var tileheight = parseInt($tileSet.attr("tileheight"), 10);
        var $image = $tileSet.find('*').filterNode("image");
        var src = $image.attr("source");
        var width = parseInt($image.attr("width"), 10);
        var height = parseInt($image.attr("height"), 10);
        var properties = this.parseProperties($tileSet);
        this.tmxContent.tilesets.push(new SimpleTmxLoader.Tileset(firstGid, name, tilewidth, tileheight, src, width, height, properties));
    }

};

SimpleTmxLoader.prototype.parseObjectgroups = function (aObjectgroups)
{
    this.tmxContent.objects = [];

    for (var iObjectGroups = 0, oObjectGroup; oObjectGroup = aObjectgroups[iObjectGroups]; iObjectGroups++) {

        var $oObjectGroup = $(oObjectGroup);
        var objectGroupName = $oObjectGroup.attr("name").toString();
        this.tmxContent.objects[objectGroupName] = [];
        var aObjects = $oObjectGroup.find('*').filterNode("object");
        for (var iObjects = 0, oObject; oObject = aObjects[iObjects]; iObjects++) {

            var $object = $(oObject);
            var x = parseInt($object.attr("x"), 10);
            var y = parseInt($object.attr("y"), 10);
            var name = $object.attr("name");
            var properties = this.parseProperties($object);

            var width = parseInt($object.attr("width"), 10);
            var height = parseInt($object.attr("height"), 10);
            var gid = parseInt($object.attr("gid"), 10);

            this.tmxContent.objects[objectGroupName].push(new SimpleTmxLoader.Object(x, y, width, height, properties, gid, name));
        }
    }


};

SimpleTmxLoader.prototype.Load = function()
{
    var self = this;
    $.ajax({
        url: this.sPath,
        type: 'get',
        dataType: 'html',
        success: function (result) {
            var $xmlParsed = $.parseXML(result);
            self.$xml = $($xmlParsed);
            //get map an create map object
            var $map = self.$xml.find("map");
            self.tmxContent.map = new SimpleTmxLoader.Map($map);

            //get layers and create them
            var aLayers = self.$xml.find('*').filterNode("layer");
            self.parseLayers(aLayers);

            //get tilesets and create them
            var aTileSets = self.$xml.find('*').filterNode("tileset");
            self.parseTilesets(aTileSets);

            //get objectgroups an create them
            var aObjectGroup = self.$xml.find('*').filterNode("objectgroup");
            self.parseObjectgroups(aObjectGroup);
            self.callback(self.tmxContent);
        }
    });

};

$.fn.filterNode = function (name) {
    return this.filter(function () {
        return this.nodeName === name;
    });
};