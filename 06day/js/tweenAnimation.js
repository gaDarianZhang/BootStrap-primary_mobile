/**
 *
 * @param el：要改变状态的元素
 * @param style：元素要改变的样式
 * @param time：要持续的时间
 * @param startState：开始状态
 * @param endState：结束状态
 * @param timeInterval：定时器时间间隔
 * @param tweenFunc：tween动作类型
 */
function tweenAnimation(el,style,time,startState,endState,timeInterval,tweenFunc) {
    let startTime = Date.now();
    let t = 0;
    let b = startState;
    let c = endState-startState;
    let d = time;
    let middleState = null;
    /**
     * 动作函数保存到一个对象内
     * @type {{linear: (function(*, *, *, *): *), backEaseOut: (function(*, *, *, *, *=): *), easeOut: (function(*, *, *, *): *)}}
     */
    let tween = {
        backEaseOut: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeOut: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        linear: function (t, b, c, d) {
            return c * t / d + b;
        }
    };

    tweenFunc = tweenFunc==undefined?"linear":tweenFunc;

    if (el.timer === undefined) {
        el.timer = {};
    }//用这种方法的话，如果我给一个属性，比如“width”连着添加了两次动画，那么第一次“width”动画的定时器还是被第二次的覆盖了，第一次的定时器就不会结束了。
    //解决办法：可以在给el.timer[style]赋值前，先把它清楚一遍 clearInterval(el.timer[style])
    clearInterval(el.timer[style]);
    el.timer[style] = setInterval(function () {
    // let timer = setInterval(function () {
        if (t>=d){
            console.log("用时：",Date.now()-startTime);
            // clearInterval(timer);
            clearInterval(el.timer[style]);
            return;
        }
        t += timeInterval;
        middleState = tween[tweenFunc](t,b,c,d);
        switch (style) {
            case "width":
            case "height":
            case "left":
            case "top":
            case "right":
            case "bottom":
                el.style[style] = middleState + "px";
                break;
            case "translate":
            case "translateX":
            case "translateY":
            case "rotate":
            case "rotateX":
            case "rotateY":
            case "scale":
            case "scaleX":
            case "scaleY":
                transformCSS(el,style,middleState);
                break;
            case "opacity":
                el.style[style] = middleState;
                break;
            default:
                el.style[style] = 0;
        };

    },timeInterval);

}