
(function (w) {
    function gesture(el,actionObj){
        el.hasGestureTriggled = false;
        el.addEventListener("touchstart",function (event) {
            console.log(event.scale);
            if (event.touches.length>=2){
                actionObj.start(event);
                el.hasGestureTirggled = true;
            }
        });
        el.addEventListener("touchmove",function (event) {
            if (event.touches.length>=2){
                actionObj.change(event);
            }
        });
        el.addEventListener("touchend",function (event) {
            if (event.touches.length<2 && el.hasGestureTirggled){
                actionObj.end(event);
                el.hasGestureTirggled = false;
            }
        });

    }
    w.gesture = gesture;
})(window)