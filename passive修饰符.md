# .passive 修饰符，addEventListener()参数具体意义

很久以前，addEventListener() 的参数约定是这样的：

```javascript
addEventListener(type, listener, useCapture)
```

后来，最后一个参数，也就是控制监听器是在捕获阶段执行还是在冒泡阶段执行的 useCapture 参数，变成了可选参数（传 true 的情况太少了），成了：

```javascript
addEventListener(type, listener[, useCapture ])
```

去年年底，DOM 规范做了修订：addEventListener() 的第三个参数可以是个对象值了，也就是说第三个参数现在可以是两种类型的值了：

```javascript
addEventListener(type, listener[, useCapture ])
addEventListener(type, listener[, options ])
```

这个修订是为了扩展新的选项，从而自定义更多的行为，目前规范中 options 对象可用的属性有三个：

```javascript
addEventListener(type, listener, {
    capture: false,
    passive: false,
    once: false
})
```

三个属性都是布尔类型的开关，默认值都为 false。其中 capture 属性等价于以前的 useCapture 参数；once 属性就是表明该监听器是一次性的，执行一次后就被自动 removeEventListener 掉。



很多移动端的页面都会监听 touchstart 等 touch 事件，像这样：

```javascript
document.addEventListener("touchstart", function(e){
    ... // 浏览器不知道这里会不会有 e.preventDefault()
})
```

由于 touchstart 事件对象的 cancelable 属性为 true，也就是说它的默认行为可以被监听器通过 preventDefault() 方法阻止，那它的默认行为是什么呢，通常来说就是滚动当前页面（还可能是缩放页面），如果它的默认行为被阻止了，页面就必须静止不动。但浏览器无法预先知道一个监听器会不会调用 preventDefault()，它能做的只有等监听器执行完后再去执行默认行为，而监听器执行是要耗时的，有些甚至耗时很明显，这样就会导致页面卡顿。视频里也说了，即便监听器是个空函数，也会产生一定的卡顿，毕竟空函数的执行也会耗时。

视频里还说了，有 80% 的滚动事件监听器是不会阻止默认行为的，也就是说大部分情况下，浏览器是白等了。所以，passive 监听器诞生了，passive 的意思是“顺从的”，表示它不会对事件的默认行为说 no，浏览器知道了一个监听器是 passive 的，它就可以在两个线程里同时执行监听器中的 JavaScript 代码和浏览器的默认行为了。

下面是在 Chrome for Android 上滚动 cnn.com 页面的对比视频，右边在注册 touchstart 事件时添加了 {passive: true} 选项，左边没有，可以看到，右边的顺畅多了。

> 假如在一个 passive 的监听器里执行了 preventDefault() 会怎么样？

假如有人不小心在 passive 的监听器里调用了 preventDefault()，也无妨，因为 preventDefault() 不会产生任何效果。

```javascript
let event = new Event("foo", {  // 创建一个 type 为 foo 的事件对象，可以被阻止默认行为 
  "cancelable": true
})

document.addEventListener("foo", function(event) { // 在 document 上绑定 foo 事件的监听函数
  console.log(event.defaultPrevented) // false
  event.preventDefault()
  console.log(event.defaultPrevented) // 还是 false，preventDefault() 无效
}, {
  passive: true
})
 
document.dispatchEvent(event) // 派发自定义事件
```

同时，浏览器的开发者工具也会发出警告：

Chrome 下：

![img](https://images2015.cnblogs.com/blog/116671/201605/116671-20160531210515742-1970759018.png)

Firefox 下：

![img](https://images2015.cnblogs.com/blog/116671/201605/116671-20160531210458117-1095589735.png)

**passive 监听器能保证的只有一点，那就是调用 preventDefault() 无效**