TimeShaft
===========

时间轴基础类,可以用于全局的函数节流,帧率控制等,附带一个其实现的Animation类


TimeShaft为静态类,接口非常简单,具体可见代码注释
-----------
* `add` : 将一个函数加入时间轴,该函数会以设定的帧率每隔一段时间执行一次,,例如60帧即 1000/60 = 16ms左右执行一次,实际运行帧率受cpu空闲程度而定
若是add的函数返回 true, 则会在该帧执行结束后remove自身,用以实现一些需要节流且仅执行一次的函数,函数之间不受影响,当时间轴中的一个函数报错后,会被移除,抛出错误,而不会影响其他函数

* `remove`: 将一个函数从时间轴中移除,需要的参数为add的返回值

* `getFPS`: 获取实际运行的平均帧率,统计方式为每10帧一次,用1秒除以10次平均执行间隔

* `setMaxFPS`: 设置运行的最大帧率,默认为60帧,其实35帧左右人眼就看不太出来了,大部分情况都不需要跑满60帧


Animation
===========

依赖于TimeShaft的动画类,可以通过TimeShaft控制整体帧率或指定单独帧率

接口
-----------

* `Animation.extend`:静态接口,用于扩展动画变换函数,src/TimingFunc.js中扩展了大量变换函数
* `play`:开始播放动画,会触发onBegin
* `pause`:暂停动画,可以通过执行play继续播放
* `stop`:终止动画,会触发onEnd
* `getFPS`:获取动画执行的帧率
* `getProgress`:获取动画执行进度,100%为一次
* `addTimes`:增加播放动画次数
* `getLeftTimes`:获取剩余的动画播放次数

PS:播放次数这个东西在想是否要保留,这个功能外部实现很简单,没有必要增加Animation本身的复杂度,目前实现是为了和css3的支持形式类似

[demo点我](http://jscodelib.sinaapp.com/TimeShaft/index.html)
[扩展的变换函数demo点我](http://jscodelib.sinaapp.com/TimeShaft/animTest.html)