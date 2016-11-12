Game.Map.MouseHandler = function (map) {
    var mapContainer = map.mapContainer;
    var isDragging = false;
    var prevX;
    var prevY;
    var renderer = document.getElementById("renderer");
    mapContainer.mousedown = function (e) {
        var pos = e.data.global;
        prevX = pos.x; prevY = pos.y;
        isDragging = true;
    };
    mapContainer.mouseup = function (e) {
        isDragging = false;
    };
    mapContainer.mousemove = function (e) {
        if (!isDragging) {
            return;
        }

        var pos = e.data.global;
        map.offsetX = pos.x - prevX;
        map.offsetY = pos.y - prevY;
        map.ConstrainMove();
        prevX = pos.x;
        prevY = pos.y;
    };


    var getGraphCoordinates = (function () {
        var ctx = {
            global: { x: 0, y: 0} // store it inside closure to avoid GC pressure
        };

        return function (x, y) {
            ctx.global.x = x; ctx.global.y = y;
            var interaction = new PIXI.interaction.InteractionData();
            return interaction.getLocalPosition(mapContainer, ctx);
        }
    }());


    var handle = function (x, y, isZoomIn) {


        var direction = isZoomIn ? 1 : -1;
        var factor = (1 + direction * 0.1666666666666666667);
        var newScale = Math.round( map.scale * factor * 10) / 10;
        newScale = Math.min(1.5, newScale);
        newScale = Math.max(0.5, newScale);
        if(map.isZoomable(newScale)) {
            mapContainer.scale.x = newScale;
            mapContainer.scale.y = newScale;
            // Technically code below is not required, but helps to zoom on mouse
            // cursor, instead center of graphGraphics coordinates
            var beforeTransform = getGraphCoordinates(x, y);
            mapContainer.updateTransform();
            var afterTransform = getGraphCoordinates(x, y);

            mapContainer.position.x += (afterTransform.x - beforeTransform.x) * mapContainer.scale.x;
            mapContainer.position.y += (afterTransform.y - beforeTransform.y) * mapContainer.scale.y;
            mapContainer.updateTransform();


            map.scale = newScale;
        }
        map.ConstrainMove();

    };


    /** Event handler for mouse wheel event.
     */
    function wheel(event) {

        var delta = 0;
        if (!event) /* For IE. */
            event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta / 120;
        } else if (event.detail) { /** Mozilla case. */
            /** In Mozilla, sign of delta is different than in IE.
             * Also, delta is multiple of 3.
             */
            delta = -event.detail / 3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta)
            handle(event.clientX, event.clientY, delta > 0);
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault)
            event.preventDefault();
        event.returnValue = false;
    }

    /** Initialization code.
     * If you use your own event management code, change it as required.
     */
    if (renderer.addEventListener) {

        /** DOMMouseScroll is for mozilla. */
        renderer.addEventListener('DOMMouseScroll', wheel, false);
    }
    /** IE/Opera. */
    renderer.onmousewheel = wheel;
};