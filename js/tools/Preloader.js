var Preloader = function () {
    this.pl = new PIXI.loaders.Loader(); // you can also create your own if you want


    var that = this;
    var assetCount = 0;
    //Preload images
    var aImages = [];

    var cacheVersion = "?v=1";

    var pixiImages = [
        // ['key1',user.static + "/" + 'abc.png' + cacheVersion],
        // ['key2',user.static + "/" + 'def.png' + cacheVersion]
    ];
    var tmxContent;

    /**
     * get all CSS defined Image-URLs
     */
    $(document).ready(function () {
        $('*').filter(function () {
            if ($(this).css('background-image').substring(0, 3) == "url") {
                var split_url = $(this).css('background-image').split("(");
                var url = (split_url[1].substr(0, split_url[1].length - 1)).replace(/"/g, "");
                if ($.inArray(url, aImages) == -1) {
                    aImages.push(url);
                }
            }
        });
    });
    /**
     *
     * @param {Array} aImages
     */
    var loadImages = function (aImages) {
        assetCount += aImages.length;
        for (var i = 0; i < aImages.length; i++) {
            var currentImage = new Image();
            currentImage.src = aImages[i];
            currentImage.onload = function () {
                $('#preloader').trigger('updateProgress', [false, 'Interface']);
            };
            currentImage.onerror = function () {
                $('#preloader').trigger('updateProgress', [true, 'Interface']);
            };
        }
    };
    /**
     *
     * @param content
     */
    var tmxLoaded = function (content) {
        tmxContent = content;
        for (var i = 0; i < tmxContent.tilesets.length; i++) {
            pixiImages.push([tmxContent.tilesets[i].name, 'assets/' + tmxContent.tilesets[i].src]);
        }
        loadImages(aImages);
        loadPixiImages(pixiImages);
    };
    /**
     *
     * @param pixiImages
     */
    var loadPixiImages = function (pixiImages) {
        assetCount += pixiImages.length;
        for (var i = 0; i < pixiImages.length; i++) {
            var currentImage = pixiImages[i];
            that.pl.add(currentImage[0], currentImage[1]);
        }
        that.pl.load();
    };


    this.pl.on('load', function (e) {
        $('#preloader').trigger('updateProgress', [false, 'Map']);
    });
    this.pl.on('error', function (e) {
        $('#preloader').trigger('updateProgress', [true, 'Map']);
    });


    var iAssetsFailedToLoad = 0;
    var iAssetsLoaded = 0;
    var currentlyLoading;

    $('#preloader').on('updateProgress', function (event, failed, type) {
        if (failed) {
            iAssetsFailedToLoad++;
        } else {
            iAssetsLoaded++;
        }
        var percent = Math.min(100, Math.round(iAssetsLoaded / assetCount * 100));
        $(".preloader-js").data("progress-percent", percent);
        //$(".preloader-js .progressValue").css( "width", percent + "%");
        $(".preloader-js .progressText").html(percent + "%");
        $(".preloader-js .progressSubText").html("loading " + type);
        moveProgressBar();
        if (iAssetsLoaded + iAssetsFailedToLoad === assetCount) {

            // //cache buster
            // for (var url in PIXI.utils.BaseTextureCache) {
            //     if (PIXI.utils.BaseTextureCache.hasOwnProperty(url)) {
            //
            //         if (url.indexOf("?") !== -1) {
            //
            //             var newUrl = url.split("?");
            //             PIXI.utils.BaseTextureCache[newUrl[0]] = PIXI.utils.BaseTextureCache[url];
            //             delete PIXI.utils.BaseTextureCache[url];
            //         }
            //     }
            // }

            $("#preloader").trigger("done", [tmxContent]);
            $("#preloader").delay(1000).fadeOut("slow");
        }
    });
    var sMap = "assets/sewers.tmx"+ cacheVersion;
    new SimpleTmxLoader(sMap, tmxLoaded);

    //http://codepen.io/thathurtabit/pen/ymECf
    function moveProgressBar() {
        var getPercent = ($('.preloader-js').data('progress-percent') / 100);
        var getProgressWrapWidth = 500; //$('.preloader-js .progressValue').width();
        var progressTotal = getPercent * getProgressWrapWidth;
        var animationLength = 0;
        // on page load, animate percentage bar to data percentage length
        // .stop() used to prevent animation queueing
        $(".preloader-js .progressValue").stop().animate({
            width: progressTotal
        }, animationLength);
    }
};