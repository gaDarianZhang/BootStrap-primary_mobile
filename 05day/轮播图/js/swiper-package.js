/**
 *
 * @param selector：轮播图包裹元素（container）
 * @param options：配置对象｛
 *                      auto : false/true;
 *                      loop: true/false;
 *                      intervalTime: 2000;
 *                      pagination: true/false;
 *                 ｝
 * @constructor：依赖transformCSS.js
 */
function Swiper(selector,options) {
    let auto = true;
    let loop = true;//是否无缝滚动
    let autoRunTime = 2500;
    let havePagination = true;
    if (options){

        auto = options.auto==undefined?true:options.auto;

        loop = options.loop==undefined?true:options.loop;

        autoRunTime = options.intervalTime==undefined?2500:options.intervalTime;
        havePagination = options.pagination==undefined?true:options.pagination;
    }


    let container = document.querySelector(selector);
    let wrapper = container.querySelector(".swiper-wrapper");
    let indexNow = loop?1:0;/*当前显示的轮播图的索引*/
    let pagination = container.querySelector(".swiper-pagination");
    let dots = null;//container.querySelectorAll(".swiper-pagination>span");
    let transitionAct = "all 1s";
    let slides = container.querySelectorAll(".swiper-wrapper>.swiper-slide");
    let autoRunTimer = null;

    let isMoving = false;//图片是否还在动画过渡中。为了应对过渡动画时间长于自动播放定时器。
    let isFirstMove = true; //touchmove中是否是第一次动
    let isVertical = false;  //是否要垂直滑动
    let goLeft = true;//正常滑动还是反向滑动


    init();
    container.addEventListener("touchstart", function (event) {
        isFirstMove = true;

        //清除图片滑动过渡效果，并且能让当前动画迅速到位，但不会触发transitionend
        wrapper.style.transition = "none";

        //关闭动画监听和自动播放定时器
        wrapper.removeEventListener("transitionend",seamlessScroll);
        clearInterval(autoRunTimer);

        this.startTime = Date.now();
        // 判断是否到了边缘，这一部分要放在获取wrapper位置的前边!!!!!!
        edgeDetection(indexNow);
        //touch位置
        this.touchstartX = event.changedTouches[0].clientX;
        this.touchstartY = event.changedTouches[0].clientY;
        //wrapper位置
        // wrapper.touchstartLeft = wrapper.offsetLeft;
        wrapper.touchstartLeft = transformCSS(wrapper,"translateX");

    });
    container.addEventListener("touchmove", function (event) {
        this.touchmoveX = event.changedTouches[0].clientX;
        this.touchmoveY = event.changedTouches[0].clientY;

        if (isFirstMove){//水平滑动，要阻止默认行为；垂直滑动不阻止默认行为，但要停止自动播放（touchstart的时候已经做了）和左右滑动。
            isFirstMove = false;
            if (Math.abs(this.touchmoveX-this.touchstartX) >= Math.abs(this.touchmoveY - this.touchstartY)){
                isVertical = false;
            }else {
                isVertical = true;
            }
        }
        if (isVertical){
            // event.stopPropagation();//不阻止默认行为
            return ;
        }
        else {
            event.preventDefault();
        }
        // wrapper.style.left = wrapper.touchstartLeft + this.touchmoveX - this.touchstartX + "px";
        transformCSS(wrapper,"translateX",wrapper.touchstartLeft + this.touchmoveX - this.touchstartX);
    });
    container.addEventListener("touchend", function (event) {
        //增加图片滑动过渡效果
        wrapper.style.transition = transitionAct;

        this.touchendX = event.changedTouches[0].clientX;
        //手指滑动过的距离
        this.endDis = this.touchendX - this.touchstartX;

        if (((Math.abs(this.endDis) >= this.clientWidth / 2) || (Date.now() - this.startTime <= 300)) && isVertical==false) {
            //判断左右滑动
            // console.log(goLeft,indexNow);
            if (this.endDis > 0) {
                indexNow = indexNow==0?indexNow:indexNow-1;
            } else if (this.endDis < 0) {
                indexNow = (indexNow==slides.length-1) ? indexNow:indexNow+1;
            }

            // console.log(goLeft,indexNow);
            paginationOn(indexNow);
        }
        // wrapper.style.left = -this.clientWidth * indexNow + "px";
        transformCSS(wrapper,"translateX",-this.clientWidth * indexNow);

        //为了应对在自动播放时，我就只是在页面上点了一下，没有发生位移，那么就不会有transition事件，transitionend监听器就不会被触发，但我直接在下边把isMoving设为true，那么autoRun就一直跑不起来。
        //还有就是当我添加了垂直滑动目的后，如果我的目的是垂直滑动，但是我松手的时候我的touchstart和touchend水平距离还是会不同的，不能因为这个把isMoving判断为了true
        isMoving = (this.endDis%container.clientWidth==0||isVertical==true)?false:true;//
        //重启自动播放
        autoRun();
    });

    //小圆点亮
    function paginationOn(index) {

        if (loop){
            if (index == 0 || index ==slides.length-1){
                index = Math.abs(index-slides.length+2);
            }
        }

        //先移除所有点的active类
        for (var i = 0; i < dots.length; i++) {
            dots[i].classList.remove("active");
        }
        dots[loop?index-1:index].classList.add("active");
    }
    //初始化设置
    function init() {
        container.style.position = "relative";
        container.style.overflow = "hidden";
        if (loop){
            //！！！！！！！！这样是不行的,而是需要把对象克隆一份。？？？为什么呢
            // wrapper.appendChild(slides[0]);//这时,slides对象中还是原始的几张图片
            // wrapper.insertBefore(slides[slides.length-1],slides[0]);//这时,slides对象中仍然还是原始的几张图片
            wrapper.appendChild(slides[0].cloneNode(true));//这时,slides对象中还是原始的几张图片
            wrapper.insertBefore(slides[slides.length-1].cloneNode(true),slides[0]);//这时,slides对象中仍然还是原始的几张图片
            //更新slides对象
            slides = container.querySelectorAll(".swiper-wrapper>.swiper-slide");
        }

        slides.forEach(function (slid){
            slid.style.width = container.clientWidth + "px";
            //  console.log(container.clientWidth);
        });

        //根据数量自动创建小圆点
        pagination.innerHTML = "<span></span>".repeat(loop?slides.length-2:slides.length);
        dots = container.querySelectorAll(".swiper-pagination>span");

        //展示第一张图片
        dots[0].classList.add("active");
        // wrapper.style.left = -container.clientWidth + "px";
        transformCSS(wrapper,"translateX",-container.clientWidth*indexNow);
        // app.addEventListener("touchmove", function (event) {
        //     event.preventDefault();
        // });

        //是否显示导航小圆点
        if (!havePagination){
            pagination.style.visibility = "hidden";
        }

        //container高度设置,放在onload里边，要不然页面元素没有渲染完就获取元素高度会得到0
        window.addEventListener('load',function () {
            container.style.height = slides[0].offsetHeight + "px";
            wrapper.style.width = slides.length*100+"%";

        });
        autoRun();

    }

    //只有在动画正常结束的时候才会触发该事件，然后边缘检测和indexNow修改都是在这里边进行的。
    //如果刚好在最后一张的时候，我快速滑动，也就是在上一个动画还没结束的时候又接着滑动了，那么
    //该事件就不会被触发，indexNow就不会被正确修改。所以，这一部分用在自动播放，手动滑动的边界判断就放在touchstart里边吧
    // wrapper.addEventListener("transitionend",seamlessScroll);

    //无缝滚动，主要用于边缘检测
    function seamlessScroll() {
        // console.log("transition end end end");
        //判断是否到了边缘
        edgeDetection(indexNow);
        isMoving = false;
    }
    function autoRun() {
        if (!auto) return ;

        //为了防止我刚好拖动了一个图片的宽度,那么就没有transition动画，那么松手后transitionend检测不到事件，isMoving就一直是true，autoRun就跑不动。
        //如果我仅仅在touchend事件内判断container.endDis%container.clientWidth==0，那么当我遇到刚好我手动滑动后是一张边缘图片。但是自动播放的边缘检测是在transitionend事件监听器里边，
        //但是呢，因为没有transition动画，就不能期待transitionend监听器把这个边缘问题给解决掉了，所以要在这里手动解决。
        //当然，如果钻牛角尖的话，如果我手动拖动了两张图片的距离，但是在touchend里边indexNow只是加了1！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
        if (container.endDis%container.clientWidth==0 && container.endDis/container.clientWidth!=0){
            edgeDetection(indexNow);
        }

        clearInterval(autoRunTimer);
        wrapper.addEventListener("transitionend",seamlessScroll);
        autoRunTimer = setInterval(function () {
            if (isMoving){
                return;
            }

            goLeft?indexNow++:indexNow--;
            wrapper.style.transition = transitionAct;
            // wrapper.style.left = -container.clientWidth * indexNow + "px";
            transformCSS(wrapper,"translateX",-container.clientWidth * indexNow);
            paginationOn(indexNow);
            isMoving = true;
        },autoRunTime);
    }
    function edgeDetection(index) {

        if (index == 0 || index == slides.length-1){
            //如果不无缝滚动，那么就来回倒着播放
            if (!loop){
                goLeft = index==0?true:false;//提供给自动播放功能用的。
                return ;
            }
            wrapper.style.transition = "none";
            indexNow = Math.abs(index-slides.length+2)
            // wrapper.style.left = - indexNow * container.clientWidth + "px";
            transformCSS(wrapper,"translateX",- indexNow * container.clientWidth);
        }
    }
}