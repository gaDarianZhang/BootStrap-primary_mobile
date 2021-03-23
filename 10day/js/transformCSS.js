/*
    函数
    transformCSS

    作用
    1. 快速设置元素的 transform 变形   ele.style.transform = 'translateX(100px)';
    transformCSS(ele, 'translateX', 100);
    transformCSS(ele, 'translateY', 100);
    transformCSS(ele, 'rotate', 50);
    transformCSS(ele, 'scale', 2);
    transformCSS(ele, 'scaleY', 1);


    2. 读取元素 transform 变形值
    transformCSS(ele, 'translateX'); // 100
    transformCSS(ele, 'rotate'); // 50
 */
/**
 *
 * @param el 要进行transform操作的元素
 * @param prop 要进行变换的属性
 * @param val   要变换的值
 * transform: translateX(100px) rotateX(45deg) scale(2);
 */
(function (w){
    function transformCSS(el,prop,val) {

        if (el.styles == undefined){
            el.styles = {};
            // console.log("kong");
        }
        if (arguments.length == 3){
            var str = "";
            el.styles[prop] = val;
            for (var style in el.styles) {
                switch (style) {
                    case "translateX":
                    case "translateY":
                    case "translateZ":
                        str += style+"("+el.styles[style]+"px) ";
                        break;
                    case 'rotate':
                    case "rotateX":
                    case "rotateY":
                    case "rotateZ":
                        str += style+"("+el.styles[style]+"deg) ";
                        break;
                    case "scale":
                    case "scaleX":
                    case "scaleY":
                    case "scaleZ":
                        str += style+"("+el.styles[style]+") ";
                }
            }

            el.style.transform = str;
        }
        else if (arguments.length==2){
            if (el.styles[prop]){
                return el.styles[prop];
            }
            //如果没有设置，则返回默认值
            if (prop.substr(0,5)=="scale"){
                return 1;
            }
            else{
                return 0;
            }
        }
    }
    w.transformCSS = transformCSS;
})(window);

// var box = document.getElementById("box");
// transformCSS(box,"translateX",100);