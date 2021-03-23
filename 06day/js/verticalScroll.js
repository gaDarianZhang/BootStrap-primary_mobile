/**
 *  依赖于transformCSS.js和tweenAnimation.js
 * @param container：外部包裹容器的选择器
 * @param content：内容元素的选择器
 * @param scroBar：是一个对象，给滚动条设置属性
 * let scro = {
        bg: "rgba(123,123,123,1)",
        width:4,
    };
 */
function verticalScroll(containerSel,contentSel,scroBar) {
    let app = document.querySelector(containerSel);
    let content = document.querySelector(contentSel);
    // let html = "";
    let scroBox = null;
    let scro = scroBar;

    init();
    //拖动页面
    app.addEventListener("touchstart",function (event) {
        // console.log("touchstart");
        if (content.timer){
            clearInterval(content.timer.translateY);
        }
        if (scroBox.timer){
            clearInterval(scroBox.timer.translateY);
        }
        this.startTime = this.lastTime = Date.now();
        this.touchstartY = this.lastTouchY = event.changedTouches[0].clientY;
        content.touchEndY = content.touchstartTranY = transformCSS(content,"translateY");

        this.v = 0;
        content.addDis = 0;
    });
    app.addEventListener("touchmove",function (event) {
        this.nowTime = Date.now();
        this.useTime = this.nowTime - this.lastTime;
        this.lastTime = this.nowTime;
        //手指位置
        this.touchmoveY = event.changedTouches[0].clientY;

        //此次move的速度
        this.v = (this.touchmoveY - this.lastTouchY)/this.useTime;
        this.lastTouchY = this.touchmoveY;
        //总共的move距离
        this.moveDis = this.touchmoveY - this.touchstartY;
        //content的位置
        content.touchEndY = content.contentY = content.touchstartTranY + this.moveDis;
        //滚动条的位置
        scroBox.tranY = -(content.contentY/content.clientHeight)*app.clientHeight;
        transformCSS(scroBox,"translateY",scroBox.tranY);
        transformCSS(content,"translateY",content.contentY);

    });
    app.addEventListener("touchend",function (event) {
        if (Date.now()-this.startTime<200){
            // console.log("惯性");
            content.addDis = this.v*200;
            // console.log(content.addDis);
            content.contentY += content.addDis;
        }
        if (content.contentY>0){
            content.contentY = 0;
        }else if (content.contentY<app.clientHeight - content.offsetHeight){
            content.contentY = app.clientHeight - content.offsetHeight;
        }
        scroBox.tranY = -(content.contentY/content.clientHeight)*app.clientHeight;
        scroBox.currentY = transformCSS(scroBox,"translateY");
        //如果是无惯性拖动或者轻点不动或者点击使惯性移动暂停，addDis就是0
        if(content.addDis == 0){
            //content.touchEndY==content.contentY说明是无惯性拖动且不出界，或者是轻点不动
            //content.touchEndY == content.touchstartTranY 说明是轻点不动或者点击暂停惯性移动。如果不加这个判断，在暂停惯性运动时，会进到
            //addDis语句内，然后就去执行了下边的移动动画。
            if (content.touchEndY==content.contentY || content.touchEndY == content.touchstartTranY) return;
            //说明是手动拖过了边界。
            tweenAnimation(content,"translateY",2000,content.touchEndY,content.contentY,10,"backEaseOut");
            tweenAnimation(scroBox,"translateY",2000,scroBox.currentY,scroBox.tranY,10,"backEaseOut")
            //惯性
        }else{
            tweenAnimation(content,"translateY",1500,content.touchEndY,content.contentY,10,"easeOut");
            tweenAnimation(scroBox,"translateY",1500,scroBox.currentY,scroBox.tranY,10,"easeOut");

        }

    });

    function init() {
        // for (var i = 0; i < 100; i++) {
        //     html += i +"</br>";
        // }
        // content.innerHTML = html;
        scroBox = document.createElement("div");
        app.appendChild(scroBox);
        app.style.position = "relative";
        app.style.overflow = "hidden";
        scroBox.style.position = "absolute";
        scroBox.style.right = 0;
        scroBox.style.top = 0;
        scroBox.style.width = scro.width + "px";
        scroBox.style.height = app.clientHeight * app.clientHeight / content.offsetHeight + "px";
        scroBox.style.backgroundColor = scro.bg;
        scroBox.style.borderRadius = scro.width/2 + "px";
    }
}