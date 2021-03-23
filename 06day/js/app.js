//全局
(function () {
    //阻止默认行为
    document.getElementById("app").addEventListener("touchstart",function (event) {
        event.preventDefault();
    });

//移动端适配
    document.documentElement.style.fontSize = window.innerWidth/10 + "px";
    window.onresize = function (){
        document.documentElement.style.fontSize = window.innerWidth/10 + "px";
    }
}());
//头部
(function () {
    let app = document.getElementById("app");
    let menuBtn = document.querySelector(".head .head-up .menu");
    let headCover = document.querySelector(".head .head-cover");
    let searchInput = document.querySelector("#search-inp");
    menuBtn.addEventListener("touchstart",function () {
        this.classList.toggle("open");
        headCover.classList.toggle("open");
    });

    //搜索框获取焦点。
    //默认点击搜索框是可以获取焦点的，而且点击外部就可以失去焦点，但是因为在app内阻止了默认行为。
    searchInput.addEventListener("touchstart",function (event) {
        event.stopPropagation();
    });
    app.addEventListener("touchstart",function (event) {
        searchInput.blur();
    })

}());

//导航区
(function () {
    let nav = document.querySelector("#main .nav");
    let wrap = document.querySelector("#main .nav .wrap");
    let items = document.querySelectorAll("#main .nav .wrap li");
    let wrapMove = false;

    nav.addEventListener("touchstart",function (event) {
        //
        this.startTime = this.lastTime = Date.now();
        wrap.style.transition = "none";
        //获得触点和wrap的位置
        this.touchstartX =this.lastmoveX = event.changedTouches[0].clientX;
        this.starttransX = transformCSS(wrap,"translateX");

        //!!!!防止只点击不移动，但是上次的v还存在
        this.v = 0;
        this.moveDis = 0;
    });

    nav.addEventListener("touchmove",function (event) {
        //计算本次move用时
        this.nowTime = Date.now();
        this.useTime = this.nowTime - this.lastTime;//计算这一次move所用的时间
        this.lastTime = this.nowTime;
        // console.log("用时：",this.useTime);

        //获得触点的位置
        this.touchmoveX = event.changedTouches[0].clientX;

        //计算这次move速度
        this.v = (this.touchmoveX-this.lastmoveX)/this.useTime;//这一次move的速度
        this.lastmoveX = this.touchmoveX;
        // console.log("速度：",this.v);

        //touch移动距离
        this.moveDis = this.touchmoveX - this.touchstartX;


        this.endtransX = this.starttransX + this.moveDis;
        //橡皮筋
        if (this.endtransX>0){
            this.endtransX = this.endtransX/2;
        }else if (this.endtransX<this.clientWidth - wrap.offsetWidth){
            //(b-c)+1/2(a-(b-c)) = 1/2(a+(b-c))
            this.endtransX = (this.endtransX + this.clientWidth - wrap.offsetWidth)/2;
        }
        transformCSS(wrap,"translateX",this.endtransX);

        //修改wrap是否移动标识符
        wrapMove = true;
    });

    //拉动导航条边界松手回弹+松手惯性移动
    nav.addEventListener("touchend",function (event) {
        let wrapTranX = transformCSS(wrap,"translateX");

        //惯性
        if (Date.now()-this.startTime<200 && Math.abs(this.moveDis)>20){
            console.log("惯性");
            let addDis = this.v * 200;
            wrapTranX += addDis;
            wrap.style.transition = "2s cubic-bezier(.02,.87,.24,.98)";
            transformCSS(wrap,"translateX",wrapTranX);
        }
        //边界松手回弹
        if (wrapTranX>0){
            wrap.style.transition = ".5s cubic-bezier(.33,1.85,.67,1.3)";
            transformCSS(wrap,"translateX",0);
        }else if(wrapTranX < this.clientWidth - wrap.offsetWidth){
            wrap.style.transition = ".5s cubic-bezier(.33,1.85,.67,1.3)";
            transformCSS(wrap,"translateX",this.clientWidth - wrap.offsetWidth);
        }
        wrapMove = false;
    });

    items.forEach(function (item) {
        item.addEventListener("touchend",function () {
            if (wrapMove) return ;
            items.forEach(function (secitem) {
                secitem.classList.remove("active");
            });
            this.classList.add("active");
        })
    });
}());
//轮播图
(function () {
    new Swiper("#main .swiper");
}());

//影视区
(function () {
    let swiper1 = new Swiper("#main .floor .container",{
        pagination: false,
        loop: false,
        auto: false
    });
    // let container1 = document.querySelector("#main .floor .container");
    // container1.testFun();
}());

